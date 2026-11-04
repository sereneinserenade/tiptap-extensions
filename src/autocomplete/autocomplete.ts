import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view';

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    tiptapAutocomplete: {
      fetchAutoCompleteSuggestion: () => ReturnType;
      applySuggestion: () => ReturnType;
      rejectSuggestion: () => ReturnType;
    };
  }

  interface Storage {
    tiptapAutocomplete: TiptapAutocompleteStorage
  }
}

export const tiptapAutocompletePluginKey = new PluginKey('tiptapAutocomplete')

export interface TiptapAutocompleteOptions {
  /**
   * A function that returns a promise with the autocomplete suggestion
   * @param {string} contextBefore The text before the `/` user wrote
   * @param {string} contextAfter The text after the `/` user wrote
   * @returns {String} A promise with the autocomplete suggestion string
   * @example
   * fetchAutoCompleteSuggestion: async ({ contextBefore, contextAfter }) => {
   *   const res = await fetch('https://example.com/api/autocomplete', {
   *     method: 'POST',
   *     body: JSON.stringify({ contextBefore, contextAfter })
   *   })
   * 
   *   const data = await res.json()
   * 
   *   return data.suggestion
   * }
   */
  fetchAutoCompleteSuggestion: ({
    contextBefore,
    contextAfter
  }: {
    contextBefore: string,
    contextAfter: string
  }) => Promise<string>
}

export interface TiptapAutocompleteStorage {
  autoCompleteRes: string
}

export const TiptapAutocomplete = Extension.create<TiptapAutocompleteOptions, TiptapAutocompleteStorage>({
  name: 'tiptapAutocomplete',

  addOptions() {
    return {
      fetchAutoCompleteSuggestion: async () => 'Please give an async function to fetchAutoCompleteSuggestions',
    }
  },

  addCommands() {
    const fetchAutoCompleteSuggestion = this.options.fetchAutoCompleteSuggestion

    const getAutoCompleteRes = () => this.storage.autoCompleteRes

    return {
      fetchAutoCompleteSuggestion: () => ({ state }) => {
        const { $from } = state.selection

        const firstLevelNodeStart = $from.start(1)
        const firstLevelNodeEnd = $from.end(1)

        // runs from the `/` shortcut, before the slash is inserted at the cursor
        const contextBefore = state.doc.textBetween(firstLevelNodeStart, $from.pos)
        const contextAfter = state.doc.textBetween($from.pos, firstLevelNodeEnd)

        fetchAutoCompleteSuggestion(
          {
            contextBefore,
            contextAfter
          }
        )
          .then((res) => {
            setTimeout(() => this.editor.commands.setTextSelection($from.pos + 1))

            this.storage.autoCompleteRes = res
          })

        return false
      },
      applySuggestion: () => ({ chain }) => {
        const autoCompleteRes = getAutoCompleteRes()

        if (!autoCompleteRes) return false

        const { from, to } = this.editor.state.selection

        const text = this.editor.state.doc.textBetween(from - 1, to)

        if (text !== '/') return false

        return chain()
          .deleteRange({
            from: from - 1,
            to
          })
          .insertContent(autoCompleteRes)
          .focus()
          .run()
      },
      rejectSuggestion: () => ({ state, editor }) => {
        const { from, to } = state.selection

        this.storage.autoCompleteRes = ''

        setTimeout(() => editor.commands.setTextSelection({ from, to }))

        return true
      }
    }
  },

  addStorage() {
    return {
      autoCompleteRes: ''
    }
  },

  addKeyboardShortcuts() {
    return {
      '/': () => this.editor.commands.fetchAutoCompleteSuggestion(),
      'Tab': () => this.editor.commands.applySuggestion(),
      'Escape': () => this.editor.commands.rejectSuggestion(),
    }
  },

  addProseMirrorPlugins() {
    const getAutoCompleteRes = () => this.storage.autoCompleteRes

    const resetAutoCompleteRes = () => this.storage.autoCompleteRes = ''

    return [
      new Plugin(
        {
          key: tiptapAutocompletePluginKey,
          state: {
            init() {
              return {
                autoCompleteRes: ''
              }
            },
            apply() {
              return {
                autoCompleteRes: getAutoCompleteRes()
              }
            }
          },
          props: {
            decorations(state) {
              const pluginState = this.getState(state)

              const { from, to } = state.selection

              const text = state.doc.textBetween(from - 1, to)

              if (text !== '/') {
                resetAutoCompleteRes()
                return DecorationSet.empty
              }

              if (!pluginState?.autoCompleteRes) return DecorationSet.empty

              return DecorationSet.create(
                state.doc,
                [
                  Decoration.inline(
                    from - 1,
                    to,
                    {
                      class: 'autocomplete-suggestion',
                      'data-autocomplete': pluginState.autoCompleteRes
                    },
                  )
                ]
              )
            }
          }
        }
      )
    ]
  }
})

