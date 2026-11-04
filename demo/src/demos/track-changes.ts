import { TrackChangesKit } from '@sereneinserenade/tiptap-extensions/track-changes'
import { button, createEditor, h } from '../editor'
import type { Demo } from './types'

const users = [
  { id: 1, name: 'Ada' },
  { id: 2, name: 'Grace' },
]

export const trackChangesDemo: Demo = {
  id: 'track-changes',
  title: 'Track changes',
  summary: 'Word style suggestions. Edits become insertion and deletion marks that can be accepted or rejected.',
  importName: 'TrackChangesKit',
  mount(root) {
    const host = h('div', { className: 'editor' })
    const editor = createEditor(host, [TrackChangesKit], '<p>Turn tracking on, then type, delete or bold some words in this sentence.</p>')
    editor.chain().setCurrentUser(users[0]).setTrackChangesActive(true).run()

    const toggle = button('', () => editor.commands.toggleTrackChangesActive())
    const user = h('select', { 'aria-label': 'Current user' }, ...users.map((u) => h('option', { value: `${u.id}` }, u.name)))
    user.onchange = () => editor.commands.setCurrentUser(users.find((u) => `${u.id}` === user.value)!)

    const whole = () => ({ from: 0, to: editor.state.doc.content.size })
    const render = () => (toggle.textContent = editor.storage.trackChanges.isActive ? 'Tracking: on' : 'Tracking: off')
    editor.on('transaction', render)

    root.append(
      h('div', { className: 'toolbar' },
        toggle, user,
        button('Bold', () => editor.chain().focus().toggleBold().run()),
        button('Accept selection', () => editor.chain().focus().acceptChanges().run()),
        button('Reject selection', () => editor.chain().focus().rejectChanges().run()),
        button('Accept all', () => editor.commands.acceptChanges(whole())),
        button('Reject all', () => editor.commands.rejectChanges(whole()))),
      host,
    )
    render()

    return () => editor.destroy()
  },
}
