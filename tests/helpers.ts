import { Editor } from '@tiptap/core'
import type { AnyExtension } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

export const createEditor = (extensions: AnyExtension[], content = '<p>Hello world</p>') =>
  new Editor({ element: document.createElement('div'), extensions: [StarterKit, ...extensions], content })

export const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms))
