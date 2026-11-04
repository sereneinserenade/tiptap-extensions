import { Node, mergeAttributes, nodeInputRule } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

export interface VideoOptions {
  HTMLAttributes: Record<string, any>
  /** Insert dropped video files as data URLs. */
  allowDrop: boolean
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    video: {
      setVideo: (src: string) => ReturnType
      toggleVideo: (src: string) => ReturnType
    }
  }
}

export const VIDEO_INPUT_REGEX = /!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/

export const videoDropPluginKey = new PluginKey('videoDrop')

export const Video = Node.create<VideoOptions>({
  name: 'video',

  group: 'block',

  atom: true,

  addOptions() {
    return { HTMLAttributes: {}, allowDrop: true }
  },

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (el) => el.getAttribute('src') ?? el.querySelector('source')?.getAttribute('src') ?? null,
      },
    }
  },

  parseHTML() {
    return [{ tag: 'video' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['video', mergeAttributes({ controls: 'true', style: 'width: 100%' }, this.options.HTMLAttributes, HTMLAttributes)]
  },

  addCommands() {
    return {
      setVideo:
        (src) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { src } }),

      toggleVideo:
        (src) =>
        ({ commands }) =>
          commands.toggleNode(this.name, 'paragraph', { src }),
    }
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: VIDEO_INPUT_REGEX,
        type: this.type,
        getAttributes: ([, , src]) => ({ src }),
      }),
    ]
  },

  addProseMirrorPlugins() {
    if (!this.options.allowDrop) return []

    const type = this.type

    return [
      new Plugin({
        key: videoDropPluginKey,
        props: {
          handleDrop(view, event) {
            const videos = Array.from(event.dataTransfer?.files ?? []).filter((file) => /^video\//i.test(file.type))

            if (!videos.length) return false

            event.preventDefault()

            const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })

            if (!coordinates) return true

            videos.forEach((video) => {
              const reader = new FileReader()

              reader.onload = () => {
                // read state at load time, the doc may have changed while the file was read
                const { tr } = view.state
                const pos = tr.mapping.map(coordinates.pos)
                view.dispatch(tr.insert(pos, type.create({ src: reader.result })))
              }

              reader.readAsDataURL(video)
            })

            return true
          },
        },
      }),
    ]
  },
})
