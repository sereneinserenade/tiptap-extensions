import { Extension } from '@tiptap/core'
import type { Editor, Range } from '@tiptap/core'
import type { Node as PMNode } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Mapping } from '@tiptap/pm/transform'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import type { EditorView } from '@tiptap/pm/view'

export interface Replacement {
  value: string
}

export interface Rule {
  id: string
  description: string
  issueType: string
  category: { id: string; name: string }
}

export interface Match {
  message: string
  shortMessage: string
  replacements: Replacement[]
  offset: number
  length: number
  context: { text: string; offset: number; length: number }
  sentence: string
  type: { typeName: string }
  rule: Rule
}

export interface LanguageToolResponse {
  matches: Match[]
}

export interface LanguageToolOptions {
  /** Full URL of the `/v2/check` endpoint. The public API is rate limited, self-host for real use. */
  apiUrl: string
  /** Language code such as `en-US`, or `auto`. */
  language: string
  /** Check the document on load and after every edit. */
  automaticMode: boolean
  /** Extra form fields sent with every request, e.g. `{ username, apiKey }` for LanguageTool premium. */
  extraParams: Record<string, string>
  /** Requests are split at block boundaries to stay under this many characters. */
  maxChunkLength: number
  /** Delay after the last edit before re-checking the edited blocks. */
  debounceMs: number
  /** Passed to `isIgnored` and `onIgnore` so you can scope ignored words per document. */
  documentId?: string | number
  /** Return true to hide a match for this text, e.g. a word the user ignored earlier. */
  isIgnored?: (text: string, documentId?: string | number) => boolean | Promise<boolean>
  /** Called when a suggestion is ignored, persist it here. */
  onIgnore?: (text: string, documentId?: string | number) => void | Promise<void>
}

export interface LanguageToolStorage {
  match: Match | null
  matchRange: Range | null
  loading: boolean
  active: boolean
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    languagetool: {
      /** Check the whole document. */
      proofread: () => ReturnType
      toggleLanguageTool: () => ReturnType
      /** Replace the active match with the given text. */
      acceptLanguageToolSuggestion: (replacement: string) => ReturnType
      /** Hide every match with the same text as the active match. */
      ignoreLanguageToolSuggestion: () => ReturnType
      resetLanguageToolMatch: () => ReturnType
    }
  }

  interface Storage {
    languagetool: LanguageToolStorage
  }
}

export const languageToolPluginKey = new PluginKey<DecorationSet>('languagetool')

type LanguageToolMeta =
  | { type: 'set'; from: number; to: number; decorations: Decoration[] }
  | { type: 'remove'; text: string }
  | { type: 'clear' }
  | { type: 'refresh' }

interface Segment {
  textStart: number
  pos: number
  length: number
}

interface Chunk {
  text: string
  segments: Segment[]
  from: number
  to: number
}

interface Controller {
  check: (ranges: Range[] | null) => void
  ignore: (text: string) => void
  clear: () => void
  refresh: () => void
}

const controllers = new WeakMap<Editor, Controller>()

/** Flattens textblocks into plain text and remembers where each piece sits in the doc. */
export function collectChunks(doc: PMNode, ranges: Range[] | null, maxLength: number): Chunk[] {
  const chunks: Chunk[] = []
  let current: Chunk = { text: '', segments: [], from: -1, to: -1 }

  const flush = () => {
    if (current.text.trim()) chunks.push(current)
    current = { text: '', segments: [], from: -1, to: -1 }
  }

  doc.descendants((node, pos) => {
    if (!node.isTextblock) return true

    const end = pos + node.nodeSize

    if (ranges && !ranges.some((r) => r.from <= end && r.to >= pos)) return false

    if (current.text.length && current.text.length + node.content.size > maxLength) flush()

    if (current.from === -1) current.from = pos
    current.to = end

    node.forEach((child, offset) => {
      // non-text inline nodes count as one character so offsets stay aligned
      const text = child.isText ? child.text! : ' '
      current.segments.push({ textStart: current.text.length, pos: pos + 1 + offset, length: text.length })
      current.text += text
    })

    current.text += '\n\n'

    return false
  })

  flush()

  return chunks
}

export function offsetToPos(segments: Segment[], offset: number): number | null {
  for (const s of segments) {
    if (offset >= s.textStart && offset <= s.textStart + s.length) return s.pos + offset - s.textStart
  }

  return null
}

const findMatchAt = (state: EditorView['state'], pos: number) => {
  const found = languageToolPluginKey.getState(state)?.find(pos, pos, (spec) => !!spec.match) ?? []

  return found.find((d) => d.from <= pos && pos < d.to) ?? found[0]
}

export const LanguageTool = Extension.create<LanguageToolOptions, LanguageToolStorage>({
  name: 'languagetool',

  addOptions() {
    return {
      apiUrl: 'https://api.languagetool.org/v2/check',
      language: 'auto',
      automaticMode: true,
      extraParams: {},
      maxChunkLength: 15000,
      debounceMs: 500,
      documentId: undefined,
      isIgnored: undefined,
      onIgnore: undefined,
    }
  },

  addStorage() {
    return {
      match: null,
      matchRange: null,
      loading: false,
      active: true,
    }
  },

  addCommands() {
    const controller = () => controllers.get(this.editor)

    return {
      proofread: () => () => {
        controller()?.check(null)
        return true
      },

      toggleLanguageTool:
        () =>
        ({ commands }) => {
          this.storage.active = !this.storage.active

          if (this.storage.active) return commands.proofread()

          controller()?.clear()

          return commands.resetLanguageToolMatch()
        },

      acceptLanguageToolSuggestion:
        (replacement) =>
        ({ chain }) => {
          const range = this.storage.matchRange

          if (!range) return false

          return chain().insertContentAt(range, replacement).resetLanguageToolMatch().run()
        },

      ignoreLanguageToolSuggestion:
        () =>
        ({ commands, state }) => {
          const range = this.storage.matchRange

          if (!range) return false

          controller()?.ignore(state.doc.textBetween(range.from, range.to))

          return commands.resetLanguageToolMatch()
        },

      resetLanguageToolMatch: () => () => {
        this.storage.match = null
        this.storage.matchRange = null
        controller()?.refresh()
        return true
      },
    }
  },

  addProseMirrorPlugins() {
    const { editor, options, storage } = this
    const ignored = new Set<string>()
    const pending = new Set<Mapping>()
    let view: EditorView | null = null
    let dirty: Range[] = []
    let timer: ReturnType<typeof setTimeout> | undefined
    let inFlight = 0

    // deferred so it never lands in the middle of a command that already holds a transaction
    const dispatchMeta = (meta: LanguageToolMeta) =>
      queueMicrotask(() => {
        if (!view || view.isDestroyed) return
        view.dispatch(view.state.tr.setMeta(languageToolPluginKey, meta).setMeta('addToHistory', false))
      })

    const setLoading = (delta: number) => {
      inFlight += delta
      storage.loading = inFlight > 0
      dispatchMeta({ type: 'refresh' })
    }

    const isIgnored = async (text: string) =>
      ignored.has(text) || !!(await options.isIgnored?.(text, options.documentId))

    const fetchMatches = async (text: string): Promise<Match[]> => {
      const body = new URLSearchParams({ text, language: options.language, ...options.extraParams })

      const res = await fetch(options.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
        body,
      })

      if (!res.ok) throw new Error(`LanguageTool responded with ${res.status}`)

      return ((await res.json()) as LanguageToolResponse).matches
    }

    const checkChunk = async (chunk: Chunk) => {
      // collects every change made while the request is in flight
      const mapping = new Mapping()
      pending.add(mapping)
      setLoading(1)

      try {
        const found: { from: number; to: number; match: Match; text: string }[] = []

        for (const match of await fetchMatches(chunk.text)) {
          const from = offsetToPos(chunk.segments, match.offset)
          const to = offsetToPos(chunk.segments, match.offset + match.length)
          const text = chunk.text.slice(match.offset, match.offset + match.length)

          if (from === null || to === null || to <= from || (await isIgnored(text))) continue

          found.push({ from, to, match, text })
        }

        const decorations: Decoration[] = []

        for (const { from, to, match, text } of found) {
          const start = mapping.mapResult(from, 1)
          const end = mapping.mapResult(to, -1)

          if (start.deleted || end.deleted || end.pos <= start.pos) continue

          decorations.push(
            Decoration.inline(start.pos, end.pos, { class: `lt lt-${match.rule.issueType}`, nodeName: 'span' }, { match, text }),
          )
        }

        if (storage.active) {
          dispatchMeta({ type: 'set', from: mapping.map(chunk.from, 1), to: mapping.map(chunk.to, -1), decorations })
        }
      } catch (error) {
        console.error('[@sereneinserenade/tiptap-extensions/languagetool]', error)
      } finally {
        pending.delete(mapping)
        setLoading(-1)
      }
    }

    const check = (ranges: Range[] | null) => {
      if (!view || !storage.active) return
      collectChunks(view.state.doc, ranges, options.maxChunkLength).forEach(checkChunk)
    }

    controllers.set(editor, {
      check,
      ignore: (text) => {
        ignored.add(text)
        options.onIgnore?.(text, options.documentId)
        dispatchMeta({ type: 'remove', text })
      },
      clear: () => dispatchMeta({ type: 'clear' }),
      refresh: () => dispatchMeta({ type: 'refresh' }),
    })

    const setActiveMatch = (state: EditorView['state'], pos: number) => {
      const decoration = findMatchAt(state, pos)
      const match: Match | null = decoration?.spec.match ?? null

      if (match === storage.match) return false

      storage.match = match
      storage.matchRange = decoration ? { from: decoration.from, to: decoration.to } : null

      return true
    }

    return [
      new Plugin<DecorationSet>({
        key: languageToolPluginKey,

        state: {
          init: () => DecorationSet.empty,

          apply(tr, set) {
            pending.forEach((m) => m.appendMapping(tr.mapping))

            set = set.map(tr.mapping, tr.doc)

            const meta = tr.getMeta(languageToolPluginKey) as LanguageToolMeta | undefined

            if (meta?.type === 'set') set = set.remove(set.find(meta.from, meta.to)).add(tr.doc, meta.decorations)
            if (meta?.type === 'remove') set = set.remove(set.find(undefined, undefined, (spec) => spec.text === meta.text))
            if (meta?.type === 'clear') set = DecorationSet.empty

            if (tr.docChanged && options.automaticMode && storage.active) {
              dirty = dirty.map((r) => ({ from: tr.mapping.map(r.from, -1), to: tr.mapping.map(r.to, 1) }))

              tr.mapping.maps.forEach((map, i) => {
                const rest = tr.mapping.slice(i + 1)
                map.forEach((_oldFrom, _oldTo, from, to) => dirty.push({ from: rest.map(from, -1), to: rest.map(to, 1) }))
              })

              clearTimeout(timer)
              timer = setTimeout(() => {
                const ranges = dirty
                dirty = []
                check(ranges)
              }, options.debounceMs)
            }

            return set
          },
        },

        view(editorView) {
          view = editorView

          if (options.automaticMode) setTimeout(() => check(null))

          return {
            update(updatedView, prevState) {
              // the selection transaction itself notifies listeners, storage is set before they run
              if (!updatedView.state.selection.eq(prevState.selection)) setActiveMatch(updatedView.state, updatedView.state.selection.from)
            },
            destroy() {
              clearTimeout(timer)
              view = null
              controllers.delete(editor)
            },
          }
        },

        props: {
          decorations(state) {
            return this.getState(state)
          },

          attributes: (): Record<string, string> => (storage.active ? { spellcheck: 'false' } : {}),

          handleDOMEvents: {
            mouseover(hoverView, event) {
              const el = (event.target as HTMLElement | null)?.closest?.('.lt')

              if (!el || !hoverView.dom.contains(el)) return false

              if (setActiveMatch(hoverView.state, hoverView.posAtDOM(el, 0))) dispatchMeta({ type: 'refresh' })

              return false
            },
          },
        },
      }),
    ]
  },
})
