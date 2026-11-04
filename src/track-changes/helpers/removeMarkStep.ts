import { createId } from '../utils/time';
import { Editor } from '@tiptap/core';
import { RemoveMarkStep } from '@tiptap/pm/transform';

const removeMarkStep = (
  state: Editor['state'],
  tr: Editor['state']['tr'],
  step: RemoveMarkStep,
  newTr: Editor['state']['tr'],
  map: Editor['state']['tr']['mapping'],
  doc: Editor['state']['doc'],
  user: any,
  date: number
) => {
  doc.nodesBetween(step.from, step.to, (node, pos) => {
    if (!node.isInline) {
      return true;
    }
    if (node.marks.find((mark) => mark.type.name === 'deletion')) {
      return false;
    }
    newTr.removeMark(Math.max(step.from, pos), Math.min(step.to, pos + node.nodeSize), step.mark);

    if (
      ['italic', 'bold', 'underline'].includes(step.mark.type.name) &&
      node.marks.find((mark) => mark.type === step.mark.type)
    ) {
      const formatChangeMark = node.marks.find((mark) => mark.type.name === 'formatChange');
      let after;
      let before;
      if (formatChangeMark) {
        if (formatChangeMark.attrs.after.includes(step.mark.type.name)) {
          after = formatChangeMark.attrs.after.filter((markName: string) => markName !== step.mark.type.name);
          before = formatChangeMark.attrs.before;
        } else {
          after = formatChangeMark.attrs.after;
          before = formatChangeMark.attrs.before.concat(step.mark.type.name);
        }
      } else {
        after = [];
        before = [step.mark.type.name];
      }
      if (after.length || before.length) {
        newTr.addMark(
          Math.max(step.from, pos),
          Math.min(step.to, pos + node.nodeSize),
          state.schema.marks.formatChange.create({
            user,
            date,
            before,
            after,
            id: createId(),
          })
        );
      } else if (formatChangeMark) {
        newTr.removeMark(Math.max(step.from, pos), Math.min(step.to, pos + node.nodeSize), formatChangeMark);
      }
    }
  });
};

export default removeMarkStep;
