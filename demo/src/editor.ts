import { Editor } from '@tiptap/core'
import type { AnyExtension } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

export const createEditor = (element: HTMLElement, extensions: AnyExtension[], content: string) =>
  new Editor({ element, extensions: [StarterKit, ...extensions], content })

export const h = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Record<string, unknown> = {},
  ...children: (Node | string)[]
) => {
  const el = document.createElement(tag)
  for (const [key, value] of Object.entries(props)) {
    // aria-* and data-* only work as attributes
    if (key.includes('-')) el.setAttribute(key, `${value}`)
    else (el as any)[key] = value
  }
  el.append(...children)
  return el
}

export const button = (label: string, onClick: () => void) => h('button', { type: 'button', onclick: onClick }, label)
