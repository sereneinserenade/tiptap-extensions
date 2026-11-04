import { Editor, Range, CommandProps } from '@tiptap/core';
import { Slice } from '@tiptap/pm/model';
import { Mapping, RemoveMarkStep, ReplaceStep } from '@tiptap/pm/transform';

import removeNode from './removeNode';

export const acceptTrackChange = (
  state: Editor['state'],
  dispatch: CommandProps['dispatch'],
  range: Range
  // TODO: take care of acceptConfig and user later
  // acceptConfig,
  // user
) => {
  const { tr } = state;
  const { from, to } = range;

  tr.setMeta('AcceptReject', true);
  const mapping = new Mapping();

  tr.doc.nodesBetween(range.from, range.to, (node, pos) => {
    if (Array.isArray(node.attrs.track)) {
      if (node.attrs.track?.find((track: any) => track.type === 'deletion')) {
        removeNode(tr, node, pos, mapping);
      }

      if (node.attrs.track?.find((track: any) => track.type === 'insertion')) {
        tr.setNodeMarkup(mapping.map(pos), null, {
          ...node.attrs,
          track: [],
        });
      }

      if (node.attrs.track?.find((track: any) => track.type === 'blockChange')) {
        tr.setNodeMarkup(
          mapping.map(pos),
          null,
          {
            ...node.attrs,
            track: [],
          },
          // Object.assign(node.attrs.track, { track }),
          node.marks
        );
      }
      return;
    }

    if (!node.marks?.length) return;

    const isDeletion = node.marks.find((mark) => mark.type.name === 'deletion');

    if (isDeletion) {
      const deletionStep = new ReplaceStep(
        mapping.map(Math.max(pos, from)),
        mapping.map(Math.min(pos + node.nodeSize, to)),
        Slice.empty
      );

      tr.step(deletionStep);

      mapping.appendMap(deletionStep.getMap());
    }

    const isInsertion = node.marks.find((mark) => mark.type.name === 'insertion');

    if (isInsertion) {
      const insertionMark = node.marks.find((mark) => mark.type.name === 'insertion');

      tr.step(
        new RemoveMarkStep(
          mapping.map(Math.max(pos, from)),
          mapping.map(Math.min(pos + node.nodeSize, to)),
          insertionMark!
        )
      );
    }

    const isFormatChange = node.marks.find((mark) => mark.type.name === 'formatChange');

    if (isFormatChange) {
      const formatChangeMark = node.marks.find((mark) => mark.type.name === 'formatChange');

      tr.step(
        new RemoveMarkStep(
          mapping.map(Math.max(pos, from)),
          mapping.map(Math.min(pos + node.nodeSize, to)),
          formatChangeMark!
        )
      );
    }
  });

  if (tr.steps.length) return dispatch?.(tr);

  return false;
};
