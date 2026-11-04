import { Editor } from '@tiptap/core'
import type { AnyExtension } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { afterEach } from 'vitest'

const editors: Editor[] = []

// late editor timers otherwise fire after jsdom is torn down
afterEach(async () => {
  editors.splice(0).forEach((editor) => editor.destroy())
  await new Promise((r) => setTimeout(r, 20))
})

export const createEditor = (extensions: AnyExtension[], content = '<p>Hello world</p>') => {
  const editor = new Editor({ element: document.createElement('div'), extensions: [StarterKit, ...extensions], content })
  editors.push(editor)
  return editor
}

export const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms))
