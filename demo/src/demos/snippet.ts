import { Snippet } from '@sereneinserenade/tiptap-extensions/snippet'
import { button, createEditor, h } from '../editor'
import type { Demo } from './types'

export const snippetDemo: Demo = {
  id: 'snippet',
  title: 'Snippets',
  summary: 'Drag saved HTML snippets into the editor. Your draggable sets the snippet HTML on the drag event, the extension drops it in place.',
  importName: 'Snippet',
  mount(root) {
    const snippets = [
      { name: 'Signature', content: '<p>Best,<br>Jeet</p>' },
      { name: 'Checklist', content: '<h3>Before release</h3><ul><li><p>Tests pass</p></li><li><p>Changelog updated</p></li></ul>' },
    ]
    const list = h('ul', { className: 'side-list' })
    const host = h('div', { className: 'editor' })
    const editor = createEditor(host, [Snippet], '<p>Drag a snippet from the right into this editor.</p><p></p>')
    const name = h('input', { placeholder: 'Snippet name', 'aria-label': 'Snippet name' })

    const render = () =>
      list.replaceChildren(...snippets.map((s) =>
        h('li', {
          draggable: true,
          className: 'draggable',
          ondragstart: (e: DragEvent) => e.dataTransfer?.setData('snippet', s.content),
        }, s.name)))

    root.append(
      h('div', { className: 'toolbar' }, name, button('Save editor as snippet', () => {
        snippets.push({ name: name.value || `Snippet ${snippets.length + 1}`, content: editor.getHTML() })
        name.value = ''
        render()
      })),
      h('div', { className: 'split' }, host, list),
    )
    render()

    return () => editor.destroy()
  },
}
