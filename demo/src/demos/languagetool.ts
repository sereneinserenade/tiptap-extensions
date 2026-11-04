import { LanguageTool } from '@sereneinserenade/tiptap-extensions/languagetool'
import { button, createEditor, h } from '../editor'
import type { Demo } from './types'

export const languageToolDemo: Demo = {
  id: 'languagetool',
  title: 'LanguageTool',
  summary: 'Grammar and spell checking through a LanguageTool server. Only edited paragraphs are re-checked.',
  importName: 'LanguageTool',
  mount(root) {
    const host = h('div', { className: 'editor' })
    const panel = h('div', { className: 'lt-panel', 'aria-live': 'polite' })
    const status = h('span', { className: 'muted' })

    const editor = createEditor(host, [
      LanguageTool.configure({
        language: 'en-US',
        // the public API allows about 20 requests a minute, point this at your own server
        apiUrl: 'https://api.languagetool.org/v2/check',
        debounceMs: 1000,
      }),
    ], '<p>This are a example of a sentense with some mistaks in it.</p><p>Hover or click a underlined word to see suggestions.</p>')

    const render = () => {
      const { match, loading, active } = editor.storage.languagetool
      status.textContent = !active ? 'Off' : loading ? 'Checking…' : ''

      if (!match) {
        panel.replaceChildren(h('p', { className: 'muted' }, 'Hover or click an underlined word.'))
        return
      }

      panel.replaceChildren(
        h('p', {}, match.message),
        h('div', { className: 'toolbar' },
          ...match.replacements.slice(0, 5).map((r) => button(r.value, () => editor.chain().focus().acceptLanguageToolSuggestion(r.value).run())),
          button('Ignore', () => editor.commands.ignoreLanguageToolSuggestion())),
      )
    }

    editor.on('transaction', render)

    root.append(
      h('div', { className: 'toolbar' },
        button('Check again', () => editor.commands.proofread()),
        button('Toggle on/off', () => editor.commands.toggleLanguageTool()),
        status),
      h('div', { className: 'split' }, host, panel),
    )
    render()

    return () => editor.destroy()
  },
}
