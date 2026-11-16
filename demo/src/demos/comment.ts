import { CommentExtension } from '@sereneinserenade/tiptap-extensions/comment'
import { button, createEditor, h } from '../editor'
import type { Demo } from './types'

export const commentDemo: Demo = {
  id: 'comment',
  title: 'Comments',
  summary: 'Google Docs style comments. The mark stores only an id, so comment threads live wherever you keep them.',
  importName: 'CommentExtension',
  mount(root) {
    const threads = new Map<string, string>()
    const list = h('ul', { className: 'side-list' })
    const host = h('div', { className: 'editor' })

    const render = (activeId: string | null) => {
      list.replaceChildren(
        ...[...threads].map(([id, text]) =>
          h('li', { className: id === activeId ? 'is-active' : '', onclick: () => editor.commands.focus() }, text,
            button('Resolve', () => {
              editor.commands.unsetComment(id)
              threads.delete(id)
              render(null)
            })),
        ),
      )
      if (!threads.size) list.append(h('li', { className: 'muted' }, 'Select text and add a comment.'))
    }

    const editor = createEditor(host, [CommentExtension.configure({ onCommentActivated: render })],
      '<p>Select any words in this paragraph, type a comment above and press <strong>Add comment</strong>. Click inside commented text to highlight its thread.</p>')

    const input = h('input', { placeholder: 'Comment', 'aria-label': 'Comment text' })
    const add = button('Add comment', () => {
      const text = input.value.trim()
      if (editor.state.selection.empty || !text) return
      const id = `c${Date.now()}`
      threads.set(id, text)
      editor.chain().focus().setComment(id).run()
      input.value = ''
      render(id)
    })
    // keep the editor selection when clicking the button
    add.onmousedown = (e) => e.preventDefault()

    root.append(h('div', { className: 'toolbar' }, input, add), h('div', { className: 'split' }, host, list))
    render(null)

    return () => editor.destroy()
  },
}
