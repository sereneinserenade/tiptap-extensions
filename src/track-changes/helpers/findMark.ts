import type { EditorState } from '@tiptap/pm/state'
import type { MarkType } from '@tiptap/pm/model'

/** Last node in the selection carrying `markType`, with its range. */
export const findMark = (state: EditorState, markType: MarkType) => {
  const { $from, $to } = state.selection
  let found: { from: number; to: number; attrs: Record<string, any> } | undefined

  state.doc.nodesBetween($from.pos, $to.pos, (node, from) => {
    const mark = node.marks.find((m) => m.type === markType)
    if (mark) found = { from, to: from + node.nodeSize, attrs: mark.attrs }
  })

  return found
}
