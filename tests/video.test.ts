import { describe, expect, it } from 'vitest'
import { Video } from '../src/video'
import { createEditor } from './helpers'

describe('video', () => {
  it('inserts a video node and round-trips HTML', () => {
    const editor = createEditor([Video], '<p></p>')
    editor.commands.setVideo('https://example.com/a.mp4')

    const html = editor.getHTML()
    expect(html).toContain('<video controls="true" style="width: 100%;" src="https://example.com/a.mp4"></video>')

    editor.commands.setContent(html)
    expect(editor.getJSON().content?.find((n) => n.type === 'video')?.attrs?.src).toBe('https://example.com/a.mp4')
  })

  it('does not inject markup through src', () => {
    const editor = createEditor([Video], '<p></p>')
    editor.commands.setVideo('" onerror="alert(1)')
    expect(editor.view.dom.querySelector('[onerror]')).toBeNull()
  })
})
