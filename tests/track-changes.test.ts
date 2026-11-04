import { describe, expect, it } from 'vitest'
import { TrackChangesKit } from '../src/track-changes'
import { createEditor } from './helpers'

const setup = () => {
  const editor = createEditor([TrackChangesKit], '<p>Hello world</p>')
  editor.chain().setCurrentUser({ id: 1, name: 'Ada' }).setTrackChangesActive(true).run()
  return editor
}

const marksOf = (editor: ReturnType<typeof setup>) => {
  const marks: string[] = []
  editor.state.doc.descendants((node) => node.marks.forEach((m) => marks.push(`${m.type.name}:${node.text}`)))
  return marks
}

describe('track-changes', () => {
  it('marks typed text as an insertion and accepts it', () => {
    const editor = setup()
    editor.chain().setTextSelection(6).insertContent(' big').run()

    expect(editor.getText()).toBe('Hello big world')
    expect(marksOf(editor)).toEqual(['insertion: big'])
    expect(editor.getHTML()).toContain('data-user-name="Ada"')

    editor.commands.acceptChanges({ from: 1, to: editor.state.doc.content.size })
    expect(marksOf(editor)).toEqual([])
    expect(editor.getText()).toBe('Hello big world')
  })

  it('keeps deleted text with a deletion mark and rejects it', () => {
    const editor = setup()
    editor.commands.deleteRange({ from: 6, to: 12 })

    expect(editor.getText()).toBe('Hello world')
    expect(marksOf(editor)).toEqual(['deletion: world'])

    editor.commands.rejectChanges({ from: 1, to: editor.state.doc.content.size })
    expect(marksOf(editor)).toEqual([])
    expect(editor.getText()).toBe('Hello world')
  })

  it('removes text when a deletion is accepted', () => {
    const editor = setup()
    editor.commands.deleteRange({ from: 6, to: 12 })
    editor.commands.acceptChanges({ from: 1, to: editor.state.doc.content.size })
    expect(editor.getText()).toBe('Hello')
  })

  it('does nothing while inactive', () => {
    const editor = setup()
    editor.commands.setTrackChangesActive(false)
    editor.commands.deleteRange({ from: 6, to: 12 })
    expect(editor.getText()).toBe('Hello')
  })
})
