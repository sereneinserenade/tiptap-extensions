import { Slice } from '@tiptap/pm/model';
import { AddMarkStep, Mapping, RemoveMarkStep, ReplaceStep } from '@tiptap/pm/transform';
import { Editor, Range, CommandProps } from '@tiptap/core';

import removeNode from './removeNode';

export const rejectTrackChange = (
  state: Editor['state'],
  dispatch: CommandProps['dispatch'],
  range: Range
  // TODO: take care of rejectConfig and user later
  // rejectConfig,
  // user
) => {
  const { tr } = state;
  const { from, to } = range;

  tr.setMeta('AcceptReject', true);

  const mapping = new Mapping();

  state.doc.nodesBetween(from, to, (node, pos) => {
    if (Array.isArray(node.attrs.track) && node.attrs.track.length) {
      if (node.attrs.track.find((track: any) => track.type === 'deletion')) {
        tr.setNodeMarkup(mapping.map(pos), null, {
          ...node.attrs,
          track: [],
        });

        return;
      }

      if (node.attrs.track.find((track: any) => track.type === 'insertion')) {
        removeNode(tr, node, pos, mapping);

        return;
      }

      if (!node.isInline) {
        const blockChangeTrack = node.attrs.track.find((track: any) => track.type === 'blockChange');

        if (blockChangeTrack) {
          const track = node.attrs.track.filter((t: any) => t !== blockChangeTrack);

          tr.setNodeMarkup(
            mapping.map(pos),
            state.schema.nodes[blockChangeTrack.before.type],
            {
              ...node.attrs,
              ...blockChangeTrack.before.attrs,
              track,
            },
            node.marks
          );
        }
      }

      return;
    }

    if (!node.marks.length) return;

    const isDeletion = node.marks.find((mark) => mark.type.name === 'deletion');

    if (isDeletion) {
      const deletionMark = node.marks.find((mark) => mark.type.name === 'deletion');

      tr.step(
        new RemoveMarkStep(
          mapping.map(Math.max(pos, from)),
          mapping.map(Math.min(pos + node.nodeSize, to)),
          deletionMark!
        )
      );

      return;
    }

    const isInsertion = node.marks.find((mark) => mark.type.name === 'insertion');

    if (isInsertion) {
      const deletionStep = new ReplaceStep(
        mapping.map(Math.max(pos, from)),
        mapping.map(Math.min(pos + node.nodeSize, to)),
        Slice.empty
      );

      tr.step(deletionStep);

      mapping.appendMap(deletionStep.getMap());

      return;
    }

    const isFormatChange = node.marks.find((mark) => mark.type.name === 'formatChange');

    if (isFormatChange) {
      const formatChangeMark = node.marks.find((mark) => mark.type.name === 'formatChange')!;

      formatChangeMark.attrs.before.forEach((oldMark: any) => {
        tr.step(new AddMarkStep(range.from, range.to, state.schema.marks[oldMark].create()));
      });

      formatChangeMark.attrs.after.forEach((newMark: any) => {
        tr.step(new RemoveMarkStep(range.from, range.to, node.marks.find((mark) => mark.type.name === newMark)!));
      });

      tr.step(new RemoveMarkStep(range.from, range.to, formatChangeMark));
    }
  });

  if (tr.steps.length) return dispatch?.(tr);

  return false;
};
