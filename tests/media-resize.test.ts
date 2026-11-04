import { describe, expect, it } from 'vitest'
import { ResizableMedia } from '../src/media-resize'
import { createEditor } from './helpers'

describe('media-resize', () => {
  it('renders a node view and round-trips attributes through HTML', () => {
    const editor = createEditor([ResizableMedia], '<p></p>')
    editor.commands.setMedia({ 'media-type': 'img', src: 'https://example.com/a.png', alt: 'a', width: 200, height: 100 })

    const img = editor.view.dom.querySelector('.media-node-view img') as HTMLImageElement
    expect(img.getAttribute('src')).toBe('https://example.com/a.png')
    expect(img.style.width).toBe('200px')

    const html = editor.getHTML()
    expect(html).toContain('data-align="left"')

    editor.commands.setContent(html.replace('data-align="left"', 'data-float="right"'))
    const node = editor.state.doc.firstChild!
    expect(node.type.name).toBe('resizableMedia')
    expect(node.attrs).toMatchObject({ src: 'https://example.com/a.png', width: 200, dataFloat: 'right' })
  })

  it('toolbar buttons update alignment and delete the node', () => {
    const editor = createEditor([ResizableMedia], '<p></p>')
    editor.commands.setMedia({ 'media-type': 'video', src: 'https://example.com/a.mp4' })

    const buttons = editor.view.dom.querySelectorAll<HTMLButtonElement>('.media-node-view__toolbar button')
    buttons[1].click()
    expect(editor.state.doc.firstChild!.attrs.dataAlign).toBe('center')

    editor.view.dom.querySelectorAll<HTMLButtonElement>('.media-node-view__toolbar button')[5].click()
    expect(editor.view.dom.querySelector('.media-node-view')).toBeNull()
  })
})
