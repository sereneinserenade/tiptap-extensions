import { Extension } from '@tiptap/core'
import { DOMParser } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'

export interface SnippetOptions {
  /** The `DataTransfer` type your draggable snippets set their HTML under. */
  dataTransferType: string
}

export const snippetPluginKey = new PluginKey('snippet')

export const SNIPPET_DROP_META = 'isSnippetDropTransaction'

export const Snippet = Extension.create<SnippetOptions>({
  name: 'snippet',

  addOptions() {
    return { dataTransferType: 'snippet' }
  },

  addProseMirrorPlugins() {
    const { dataTransferType } = this.options

    return [
      new Plugin({
        key: snippetPluginKey,
        props: {
          handleDrop(view, event) {
            const html = event.dataTransfer?.getData(dataTransferType)

            if (!html) return false

            const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })

            if (!coordinates) return false

            event.preventDefault()

            const wrapper = document.createElement('div')
            wrapper.innerHTML = html.trim()

            const slice = DOMParser.fromSchema(view.state.schema).parseSlice(wrapper)

            view.dispatch(view.state.tr.replaceRange(coordinates.pos, coordinates.pos, slice).setMeta(SNIPPET_DROP_META, true).scrollIntoView())

            return true
          },
        },
      }),
    ]
  },
})
