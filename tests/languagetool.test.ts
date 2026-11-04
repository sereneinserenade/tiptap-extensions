import { afterEach, describe, expect, it, vi } from 'vitest'
import { LanguageTool, collectChunks, offsetToPos } from '../src/languagetool'
import { createEditor, tick } from './helpers'

const match = (offset: number, length: number) => ({
  message: 'Possible typo',
  shortMessage: '',
  replacements: [{ value: 'world' }],
  offset,
  length,
  context: { text: '', offset: 0, length: 0 },
  sentence: '',
  type: { typeName: 'Other' },
  rule: { id: 'TYPO', description: '', issueType: 'misspelling', category: { id: 'TYPOS', name: 'Typos' } },
})

const mockFetch = (matchesFor: (text: string) => ReturnType<typeof match>[]) => {
  const fetch = vi.fn(async (_url: string, init: RequestInit) => {
    const text = new URLSearchParams(init.body as string).get('text')!
    return new Response(JSON.stringify({ matches: matchesFor(text) }))
  })
  vi.stubGlobal('fetch', fetch)
  return fetch
}

afterEach(() => vi.unstubAllGlobals())

describe('languagetool helpers', () => {
  it('maps text offsets back to document positions across blocks', () => {
    const editor = createEditor([], '<p>ab</p><p>cd</p>')
    const [chunk] = collectChunks(editor.state.doc, null, 1000)

    expect(chunk.text).toBe('ab\n\ncd\n\n')
    expect(offsetToPos(chunk.segments, 0)).toBe(1)
    expect(offsetToPos(chunk.segments, 4)).toBe(5)
    expect(offsetToPos(chunk.segments, 3)).toBeNull()
  })

  it('splits long documents at block boundaries', () => {
    const editor = createEditor([], '<p>aaaa</p><p>bbbb</p><p>cccc</p>')
    expect(collectChunks(editor.state.doc, null, 8).map((c) => c.text.trim())).toEqual(['aaaa', 'bbbb', 'cccc'])
  })
})

describe('languagetool', () => {
  it('decorates matches, exposes the active match and accepts a replacement', async () => {
    mockFetch((text) => (text.includes('wrld') ? [match(text.indexOf('wrld'), 4)] : []))
    const editor = createEditor([LanguageTool], '<p>Hello wrld</p>')
    await tick(10)

    const el = editor.view.dom.querySelector('.lt.lt-misspelling')
    expect(el?.textContent).toBe('wrld')

    editor.commands.setTextSelection(8)
    expect(editor.storage.languagetool.match?.rule.id).toBe('TYPO')

    editor.commands.acceptLanguageToolSuggestion('world')
    expect(editor.getText()).toBe('Hello world')
  })

  it('keeps decorations on the right text when the doc changes mid-request', async () => {
    let resolve!: () => void
    const gate = new Promise<void>((r) => (resolve = r))
    vi.stubGlobal('fetch', async () => {
      await gate
      return new Response(JSON.stringify({ matches: [match(6, 4)] }))
    })

    const editor = createEditor([LanguageTool.configure({ automaticMode: false })], '<p>Hello wrld</p>')
    editor.commands.proofread()
    await tick()
    editor.commands.insertContentAt(1, 'Oh. ')
    resolve()
    await tick(10)

    expect(editor.view.dom.querySelector('.lt')?.textContent).toBe('wrld')
  })

  it('ignores a suggestion everywhere and reports it', async () => {
    mockFetch((text) => [...text.matchAll(/wrld/g)].map((m) => match(m.index!, 4)))
    const onIgnore = vi.fn()
    const editor = createEditor([LanguageTool.configure({ onIgnore, documentId: 'doc' })], '<p>wrld and wrld</p>')
    await tick(10)
    expect(editor.view.dom.querySelectorAll('.lt')).toHaveLength(2)

    editor.commands.setTextSelection(2)
    editor.commands.ignoreLanguageToolSuggestion()
    await tick()

    expect(onIgnore).toHaveBeenCalledWith('wrld', 'doc')
    expect(editor.view.dom.querySelectorAll('.lt')).toHaveLength(0)
  })

  it('re-checks only edited blocks after typing', async () => {
    const fetch = mockFetch(() => [])
    const editor = createEditor([LanguageTool.configure({ debounceMs: 5 })], '<p>one</p><p>two</p>')
    await tick(10)
    fetch.mockClear()

    editor.commands.insertContentAt(2, 'x')
    await tick(20)

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(new URLSearchParams(fetch.mock.calls[0][1].body as string).get('text')).toBe('oxne\n\n')
  })
})
