import { describe, expect, it, vi } from 'vitest'
import { CommentExtension } from '../src/comment'
import { createEditor } from './helpers'

describe('comment', () => {
  it('sets, activates and removes a comment', () => {
    const onCommentActivated = vi.fn()
    const editor = createEditor([CommentExtension.configure({ onCommentActivated })])

    expect(editor.chain().setTextSelection({ from: 1, to: 6 }).setComment('c1').run()).toBe(true)
    expect(editor.getHTML()).toContain('<span data-comment-id="c1">Hello</span>')

    editor.commands.setTextSelection(3)
    expect(editor.storage.comment.activeCommentId).toBe('c1')
    expect(onCommentActivated).toHaveBeenLastCalledWith('c1')

    editor.commands.unsetComment('c1')
    expect(editor.getHTML()).toBe('<p>Hello world</p>')
  })

  it('refuses an empty id', () => {
    const editor = createEditor([CommentExtension])
    expect(editor.commands.setComment('')).toBe(false)
  })
})
