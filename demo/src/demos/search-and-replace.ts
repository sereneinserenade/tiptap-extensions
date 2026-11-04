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
    const content = '<p>The cat sat. A Cat ran. The cot was empty.</p><p>Search for <code>cat</code>, or turn on regex and try <code>c.t</code>.</p>'
    // regex is an extension option, so the toggle recreates the editor
    const make = (regex: boolean, html: string) => createEditor(host, [SearchAndReplace.configure({ disableRegex: !regex })], html)
    let editor = make(false, content)
    const count = h('span', { className: 'muted' })

    const search = h('input', { placeholder: 'Search', 'aria-label': 'Search' })
    const replace = h('input', { placeholder: 'Replace', 'aria-label': 'Replace' })
    const caseSensitive = h('input', { type: 'checkbox' })
    const regex = h('input', { type: 'checkbox' })

    const update = () => {
      const { results, resultIndex } = editor.storage.searchAndReplace
      count.textContent = results.length ? `${resultIndex + 1} of ${results.length}` : 'No results'
    }

    search.oninput = () => editor.chain().setSearchTerm(search.value).resetIndex().run()
    replace.oninput = () => editor.commands.setReplaceTerm(replace.value)
    caseSensitive.onchange = () => editor.commands.setCaseSensitive(caseSensitive.checked)
    const wire = () => {
      editor.on('transaction', update)
      editor.commands.setCaseSensitive(caseSensitive.checked)
      editor.commands.setReplaceTerm(replace.value)
      editor.commands.setSearchTerm(search.value)
    }

    regex.onchange = () => {
      const html = editor.getHTML()
      editor.destroy()
      host.replaceChildren()
      editor = make(regex.checked, html)
      wire()
    }

    wire()

    root.append(
      h('div', { className: 'toolbar' },
        search, replace,
        h('label', {}, caseSensitive, ' Case sensitive'),
        h('label', {}, regex, ' Regex'),
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
