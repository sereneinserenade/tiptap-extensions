import { ResizableMedia } from '@sereneinserenade/tiptap-extensions/media-resize'
import { button, createEditor, h } from '../editor'
import type { Demo } from './types'

const IMAGE = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200'

export const mediaResizeDemo: Demo = {
  id: 'media-resize',
  title: 'Media resize',
  summary: 'Images and videos you can resize by dragging the right or bottom edge, align, float or delete. Plain DOM, works with any framework.',
  importName: 'ResizableMedia',
  mount(root) {
    const host = h('div', { className: 'editor' })
    const editor = createEditor(host, [ResizableMedia],
      `<p>Click the image to show its toolbar. Drag the right or bottom edge to resize.</p><img src="${IMAGE}" alt="Mountains" width="360"><p>Floated media lets text wrap around it. Try "Float left" and watch this paragraph move next to the image.</p>`)

    const url = h('input', { value: IMAGE, 'aria-label': 'Media URL', className: 'grow' })

    root.append(
      h('div', { className: 'toolbar' },
        url,
        button('Insert image', () => url.value && editor.chain().focus().setMedia({ 'media-type': 'img', src: url.value, width: 320 }).run()),
        button('Insert video', () => url.value && editor.chain().focus().setMedia({ 'media-type': 'video', src: url.value, width: 360 }).run())),
      host,
    )

    return () => editor.destroy()
  },
}
