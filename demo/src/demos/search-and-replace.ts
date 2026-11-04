import { SearchAndReplace } from '@sereneinserenade/tiptap-extensions/search-and-replace'
import { button, createEditor, h } from '../editor'
import type { Demo } from './types'

export const searchAndReplaceDemo: Demo = {
  id: 'search-and-replace',
  title: 'Search and replace',
  summary: 'Find, step through and replace text, with optional regex and case sensitivity.',
  importName: 'SearchAndReplace',
  mount(root) {
    const host = h('div', { className: 'editor' })
    const editor = createEditor(host, [SearchAndReplace], '<p>The cat sat. A Cat ran. The cat slept.</p><p>Try searching for <code>cat</code> or a regex like <code>c.t</code>.</p>')
    const count = h('span', { className: 'muted' })

    const search = h('input', { placeholder: 'Search', 'aria-label': 'Search' })
    const replace = h('input', { placeholder: 'Replace', 'aria-label': 'Replace' })
    const caseSensitive = h('input', { type: 'checkbox' })

    const update = () => {
      const { results, resultIndex } = editor.storage.searchAndReplace
      count.textContent = results.length ? `${resultIndex + 1} of ${results.length}` : 'No results'
    }

    search.oninput = () => editor.chain().setSearchTerm(search.value).resetIndex().run()
    replace.oninput = () => editor.commands.setReplaceTerm(replace.value)
    caseSensitive.onchange = () => editor.commands.setCaseSensitive(caseSensitive.checked)
    editor.on('transaction', update)

    root.append(
      h('div', { className: 'toolbar' },
        search, replace,
        h('label', {}, caseSensitive, ' Case sensitive'),
        button('Previous', () => editor.commands.previousSearchResult()),
        button('Next', () => editor.commands.nextSearchResult()),
        button('Replace', () => editor.commands.replace()),
        button('Replace all', () => editor.commands.replaceAll()),
        count),
      host,
    )
    update()

    return () => editor.destroy()
  },
}
