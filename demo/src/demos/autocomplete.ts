import { TiptapAutocomplete } from '@sereneinserenade/tiptap-extensions/autocomplete'
import { createEditor, h } from '../editor'
import type { Demo } from './types'

export const autocompleteDemo: Demo = {
  id: 'autocomplete',
  title: 'Autocomplete',
  summary: 'Gmail style completion. Type / to ask for text that fits between what comes before and after the cursor.',
  importName: 'TiptapAutocomplete',
  mount(root) {
    const host = h('div', { className: 'editor' })
    const editor = createEditor(host, [
      TiptapAutocomplete.configure({
        // replace with a call to your model, both sides of the cursor are passed in
        fetchAutoCompleteSuggestion: async ({ contextBefore }) => (contextBefore.trim().endsWith('Dear') ? ' team,' : ' hope this finds you well'),
      }),
    ], '<p>Dear </p><p>I </p>')

    root.append(h('p', { className: 'hint' }, 'Type / after "Dear" or "I". Tab accepts, Escape rejects.'), host)

    return () => editor.destroy()
  },
}
