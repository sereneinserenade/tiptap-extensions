import { Node, mergeAttributes, nodeInputRule } from '@tiptap/core'
import type { Editor } from '@tiptap/core'
import type { Node as PMNode } from '@tiptap/pm/model'
import type { NodeView } from '@tiptap/pm/view'

export type MediaType = 'img' | 'video'
export type MediaAlign = 'left' | 'center' | 'right'
export type MediaFloat = 'left' | 'right'

export interface SetMediaOptions {
  'media-type': MediaType
  src: string
  alt?: string
  title?: string
  width?: number | string
  height?: number | string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    resizableMedia: {
      setMedia: (options: SetMediaOptions) => ReturnType
    }
  }
}

export interface ResizableMediaOptions {
  HTMLAttributes: Record<string, any>
  /** Smallest width or height in px a resize can reach. */
  minSize: number
}

export const IMAGE_INPUT_REGEX = /(?:^|\s)(!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\))$/

const ICON_PATHS: Record<string, string> = {
  'align-left':
    'M6 17h12a1 1 0 0 1 0 2H6a1 1 0 0 1 0-2zm0-8h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1zm0-4h12a1 1 0 0 1 0 2H6a1 1 0 1 1 0-2z',
  'align-center':
    'M6 17h12a1 1 0 0 1 0 2H6a1 1 0 0 1 0-2zm4-8h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1zM6 5h12a1 1 0 0 1 0 2H6a1 1 0 1 1 0-2z',
  'align-right':
    'M6 17h12a1 1 0 0 1 0 2H6a1 1 0 0 1 0-2zm8-8h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1zM6 5h12a1 1 0 0 1 0 2H6a1 1 0 1 1 0-2z',
  'float-left':
    'M6 17h12a1 1 0 010 2H6a1 1 0 010-2zm8-8h4a1 1 0 010 2h-4a1 1 0 010-2zm0 4h4a1 1 0 010 2h-4a1 1 0 010-2zM6 9h4a1 1 0 011 1v4a1 1 0 01-1 1H6a1 1 0 01-1-1v-4a1 1 0 011-1zm0-4h12a1 1 0 010 2H6a1 1 0 110-2z',
  'float-right':
    'M6 17h12a1 1 0 010 2H6a1 1 0 010-2zm0-8h4a1 1 0 010 2H6a1 1 0 010-2zm0 4h4a1 1 0 010 2H6a1 1 0 010-2zm8-4h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4a1 1 0 011-1zM6 5h12a1 1 0 010 2H6a1 1 0 110-2z',
  delete:
    'M7 7h10a1 1 0 010 2H7a1 1 0 110-2zm2.78 11a1 1 0 01-.97-.757L7.156 10.62A.5.5 0 017.64 10h8.72a.5.5 0 01.485.621l-1.656 6.622a1 1 0 01-.97.757H9.781zM11 6h2a1 1 0 011 1h-4a1 1 0 011-1z',
}

interface MediaAction {
  icon: keyof typeof ICON_PATHS
  label: string
  attrs?: { dataAlign: MediaAlign | null; dataFloat: MediaFloat | null }
}

export const resizableMediaActions: MediaAction[] = [
  { icon: 'align-left', label: 'Align left', attrs: { dataAlign: 'left', dataFloat: null } },
  { icon: 'align-center', label: 'Align center', attrs: { dataAlign: 'center', dataFloat: null } },
  { icon: 'align-right', label: 'Align right', attrs: { dataAlign: 'right', dataFloat: null } },
  { icon: 'float-left', label: 'Float left', attrs: { dataAlign: null, dataFloat: 'left' } },
  { icon: 'float-right', label: 'Float right', attrs: { dataAlign: null, dataFloat: 'right' } },
  { icon: 'delete', label: 'Delete' },
]

const SVG_NS = 'http://www.w3.org/2000/svg'

const createIcon = (name: string) => {
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('width', '1.2em')
  svg.setAttribute('height', '1.2em')
  svg.setAttribute('aria-hidden', 'true')
  const path = document.createElementNS(SVG_NS, 'path')
  path.setAttribute('d', ICON_PATHS[name])
  path.setAttribute('fill', 'currentColor')
  path.setAttribute('fill-rule', 'evenodd')
  svg.appendChild(path)
  return svg
}

const toPx = (value: unknown) => (typeof value === 'number' ? `${value}px` : (value as string | null) ?? '')

class ResizableMediaView implements NodeView {
  dom: HTMLElement
  private media: HTMLImageElement | HTMLVideoElement
  private toolbar: HTMLElement
  private buttons: { action: MediaAction; el: HTMLButtonElement }[] = []

  constructor(
    private node: PMNode,
    private editor: Editor,
    private getPos: () => number | undefined,
    private options: ResizableMediaOptions,
  ) {
    this.dom = document.createElement('div')
    this.dom.className = 'media-node-view'
    this.dom.style.display = 'flex'

    const frame = document.createElement('div')
    frame.className = 'media-node-view__frame'
    frame.style.position = 'relative'
    frame.style.width = 'fit-content'
    frame.style.maxWidth = '100%'

    this.media = document.createElement(node.attrs['media-type'] === 'video' ? 'video' : 'img')
    this.media.draggable = false
    if (this.media instanceof HTMLVideoElement) this.media.controls = true
    this.media.style.display = 'block'
    this.media.style.maxWidth = '100%'

    this.toolbar = document.createElement('div')
    this.toolbar.className = 'media-node-view__toolbar'
    this.toolbar.setAttribute('role', 'toolbar')
    this.toolbar.setAttribute('aria-label', 'Media options')
    this.toolbar.hidden = true

    for (const action of resizableMediaActions) {
      const el = document.createElement('button')
      el.type = 'button'
      el.title = action.label
      el.setAttribute('aria-label', action.label)
      el.appendChild(createIcon(action.icon))
      el.addEventListener('mousedown', (e) => e.preventDefault())
      el.addEventListener('click', () => this.runAction(action))
      this.toolbar.appendChild(el)
      this.buttons.push({ action, el })
    }

    frame.append(this.media, this.createHandle('horizontal'), this.createHandle('vertical'), this.toolbar)
    this.dom.appendChild(frame)

    this.render()
  }

  private createHandle(direction: 'horizontal' | 'vertical') {
    const handle = document.createElement('div')
    handle.className = `media-node-view__handle media-node-view__handle--${direction}`
    handle.title = 'Resize'
    Object.assign(handle.style, {
      position: 'absolute',
      touchAction: 'none',
      ...(direction === 'horizontal'
        ? { top: '0', right: '0', width: '8px', height: '100%', cursor: 'col-resize' }
        : { bottom: '0', left: '0', width: '100%', height: '8px', cursor: 'row-resize' }),
    })

    handle.addEventListener('pointerdown', (event) => this.startResize(event, direction, handle))

    return handle
  }

  private aspectRatio() {
    const m = this.media
    const ratio =
      m instanceof HTMLVideoElement ? m.videoWidth / m.videoHeight : m.naturalWidth / m.naturalHeight

    return Number.isFinite(ratio) && ratio > 0 ? ratio : m.offsetWidth / m.offsetHeight || 1
  }

  private startResize(event: PointerEvent, direction: 'horizontal' | 'vertical', handle: HTMLElement) {
    event.preventDefault()
    handle.setPointerCapture(event.pointerId)

    const ratio = this.aspectRatio()
    const maxWidth = this.editor.view.dom.clientWidth || Infinity
    const startX = event.clientX
    const startY = event.clientY
    const startWidth = this.media.offsetWidth
    const startHeight = this.media.offsetHeight
    let size = { width: startWidth, height: startHeight }

    const onMove = (e: PointerEvent) => {
      let width = direction === 'horizontal' ? startWidth + e.clientX - startX : (startHeight + e.clientY - startY) * ratio
      width = Math.min(width, maxWidth)
      const height = width / ratio

      if (width < this.options.minSize || height < this.options.minSize) return

      size = { width: Math.round(width), height: Math.round(height) }
      this.media.style.width = `${size.width}px`
      this.media.style.height = `${size.height}px`
    }

    const onUp = () => {
      handle.removeEventListener('pointermove', onMove)
      handle.removeEventListener('pointerup', onUp)
      handle.removeEventListener('pointercancel', onUp)
      this.updateAttributes(size)
    }

    handle.addEventListener('pointermove', onMove)
    handle.addEventListener('pointerup', onUp)
    handle.addEventListener('pointercancel', onUp)
  }

  private updateAttributes(attrs: Record<string, unknown>) {
    const pos = this.getPos()

    if (typeof pos !== 'number') return

    this.editor.view.dispatch(this.editor.state.tr.setNodeMarkup(pos, undefined, { ...this.node.attrs, ...attrs }))
  }

  private runAction(action: MediaAction) {
    const pos = this.getPos()

    if (typeof pos !== 'number') return

    if (!action.attrs) {
      this.editor.chain().focus().deleteRange({ from: pos, to: pos + this.node.nodeSize }).run()
      return
    }

    this.updateAttributes(action.attrs)
  }

  private render() {
    const { src, alt, title, width, height, dataAlign, dataFloat } = this.node.attrs

    if (this.media.getAttribute('src') !== src) this.media.setAttribute('src', src ?? '')
    if (this.media instanceof HTMLImageElement) this.media.alt = alt ?? ''
    if (title) this.media.title = title
    else this.media.removeAttribute('title')

    this.media.style.width = toPx(width)
    this.media.style.height = toPx(height)

    this.dom.style.justifyContent = { left: 'flex-start', center: 'center', right: 'flex-end' }[dataAlign as MediaAlign] ?? ''
    this.dom.style.float = dataFloat ?? ''
    this.dom.dataset.align = dataAlign ?? ''
    this.dom.dataset.float = dataFloat ?? ''

    for (const { action, el } of this.buttons) {
      const active = !!action.attrs && action.attrs.dataAlign === dataAlign && action.attrs.dataFloat === dataFloat
      el.classList.toggle('is-active', active)
      if (action.attrs) el.setAttribute('aria-pressed', `${active}`)
    }
  }

  update(node: PMNode) {
    if (node.type !== this.node.type || node.attrs['media-type'] !== this.node.attrs['media-type']) return false
    this.node = node
    this.render()
    return true
  }

  selectNode() {
    this.dom.classList.add('ProseMirror-selectednode')
    this.toolbar.hidden = !this.editor.isEditable
  }

  deselectNode() {
    this.dom.classList.remove('ProseMirror-selectednode')
    this.toolbar.hidden = true
  }

  stopEvent(event: Event) {
    const target = event.target as HTMLElement
    return this.toolbar.contains(target) || target.classList.contains('media-node-view__handle')
  }

  ignoreMutation() {
    return true
  }
}

export const ResizableMedia = Node.create<ResizableMediaOptions>({
  name: 'resizableMedia',

  group: 'block',

  draggable: true,

  selectable: true,

  atom: true,

  addOptions() {
    return { HTMLAttributes: {}, minSize: 50 }
  },

  addAttributes() {
    return {
      src: { default: null },
      'media-type': { default: 'img' },
      alt: { default: null },
      title: { default: null },
      width: { default: null },
      height: { default: null },
      dataAlign: {
        default: 'left',
        parseHTML: (el) => el.getAttribute('data-align') ?? 'left',
        renderHTML: (attrs) => (attrs.dataAlign ? { 'data-align': attrs.dataAlign } : {}),
      },
      dataFloat: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-float'),
        renderHTML: (attrs) => (attrs.dataFloat ? { 'data-float': attrs.dataFloat } : {}),
      },
    }
  },

  parseHTML() {
    return [
      { tag: 'img[src]:not([src^="data:"])', getAttrs: () => ({ 'media-type': 'img' }) },
      {
        tag: 'video',
        getAttrs: (el) => ({
          'media-type': 'video',
          src: el.getAttribute('src') ?? el.querySelector('source')?.getAttribute('src') ?? null,
        }),
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const { 'media-type': mediaType, ...attrs } = HTMLAttributes
    const merged = mergeAttributes(this.options.HTMLAttributes, attrs)

    return mediaType === 'video' ? ['video', { controls: 'true', ...merged }] : ['img', merged]
  },

  addCommands() {
    return {
      setMedia:
        (options) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: options }),
    }
  },

  addNodeView() {
    return ({ node, editor, getPos }) => new ResizableMediaView(node, editor, getPos, this.options)
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: IMAGE_INPUT_REGEX,
        type: this.type,
        getAttributes: ([, , alt, src, title]) => ({ src, alt, title, 'media-type': 'img' }),
      }),
    ]
  },
})
