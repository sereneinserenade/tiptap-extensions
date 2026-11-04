import { InlineSuggestion } from '@sereneinserenade/tiptap-extensions/inline-suggestion'
import { createEditor, h } from '../editor'
import type { Demo } from './types'

const endings = [' and that is how the story ends.', ', which nobody expected.', ' right before lunch.']

export const inlineSuggestionDemo: Demo = {
  id: 'inline-suggestion',
  title: 'Inline suggestion',
  summary: 'Copilot style ghost text. Press Tab to fetch a suggestion, Tab again to accept it.',
  importName: 'InlineSuggestion',
  mount(root) {
    const host = h('div', { className: 'editor' })
    let i = 0
    const editor = createEditor(host, [
      InlineSuggestion.configure({
        // replace with a call to your model
        fetchAutocompletion: async () => endings[i++ % endings.length],
      }),
    ], '<p>Put the cursor at the end of this line and press Tab</p>')

    root.append(h('p', { className: 'hint' }, 'Tab fetches, Tab accepts, any other key dismisses.'), host)

    return () => editor.destroy()
  },
}
