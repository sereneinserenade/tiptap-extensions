import { describe, expect, it } from 'vitest'
import { Snippet, snippetPluginKey } from '../src/snippet'
import { createEditor } from './helpers'

const dropEvent = (data: Record<string, string>) =>
  ({ clientX: 0, clientY: 0, dataTransfer: { getData: (t: string) => data[t] ?? '' }, preventDefault() {} }) as unknown as DragEvent

describe('snippet', () => {
  it('inserts the dragged snippet HTML at the drop point', () => {
    const editor = createEditor([Snippet], '<p>end</p>')
    const view = editor.view
    view.posAtCoords = () => ({ pos: 0, inside: -1 })

    const plugin = snippetPluginKey.get(view.state)!
    const handled = plugin.props.handleDrop!.call(plugin, view, dropEvent({ snippet: '<h2>Title</h2>' }), view.state.doc.slice(0), false)

    expect(handled).toBe(true)
    expect(editor.getHTML()).toBe('<h2>Title</h2><p>end</p>')
  })

  it('leaves other drops to the editor', () => {
    const editor = createEditor([Snippet])
    const plugin = snippetPluginKey.get(editor.view.state)!
    expect(plugin.props.handleDrop!.call(plugin, editor.view, dropEvent({}), editor.state.doc.slice(0), false)).toBe(false)
  })
})
