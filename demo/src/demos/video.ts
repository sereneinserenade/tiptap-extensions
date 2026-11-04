import { Video } from '@sereneinserenade/tiptap-extensions/video'
import { button, createEditor, h } from '../editor'
import type { Demo } from './types'

const SAMPLE = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'

export const videoDemo: Demo = {
  id: 'video',
  title: 'Video',
  summary: 'A block video node. Insert by URL, by markdown style ![](url), or by dropping a video file.',
  importName: 'Video',
  mount(root) {
    const host = h('div', { className: 'editor' })
    const editor = createEditor(host, [Video], `<p>Drop a video file here or use the button.</p><video src="${SAMPLE}"></video><p></p>`)

    root.append(
      h('div', { className: 'toolbar' }, button('Insert video by URL', () => {
        const src = prompt('Video URL', SAMPLE)
        if (src) editor.chain().focus().setVideo(src).run()
      })),
      host,
    )

    return () => editor.destroy()
  },
}
