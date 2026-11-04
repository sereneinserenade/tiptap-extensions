import { createId } from '../utils/time';
import { Editor } from '@tiptap/core';
import { AddMarkStep } from '@tiptap/pm/transform';

const addMarkStep = (
  state: Editor['state'],
  tr: Editor['state']['tr'],
  step: AddMarkStep,
  newTr: Editor['state']['tr'],
  map: Editor['state']['tr']['mapping'],
  doc: Editor['state']['doc'],
  user: { id: string; username: string },
  date: number
) => {
  doc.nodesBetween(step.from, step.to, (node, pos) => {
    if (!node.isInline) {
      return true;
    }
    if (node.marks.find((mark) => mark.type.name === 'deletion')) {
      return false;
    }
    newTr.addMark(Math.max(step.from, pos), Math.min(step.to, pos + node.nodeSize), step.mark);

    if (!['deletion'].includes(step.mark.type.name) && !node.marks.find((mark) => mark.type === step.mark.type)) {
      const formatChangeMark = node.marks.find((mark) => mark.type.name === 'formatChange');
      let after;
      let before;
      if (formatChangeMark) {
        if (formatChangeMark.attrs.before.includes(step.mark.type.name)) {
          before = formatChangeMark.attrs.before.filter((markName: string) => markName !== step.mark.type.name);
          after = formatChangeMark.attrs.after;
        } else {
          before = formatChangeMark.attrs.before;
          after = formatChangeMark.attrs.after.concat(step.mark.type.name);
        }
      } else {
        before = [];
        after = [step.mark.type.name];
      }
      if (after.length || before.length) {
        // Math.max(step.from, pos),
        // Math.min(step.to, pos + node.nodeSize),
        newTr.addMark(
          step.from,
          step.to,
          state.schema.marks.formatChange.create({
            id: createId(),
            user: user,
            date,
            before,
            after,
          })
        );
      } else if (formatChangeMark) {
        newTr.removeMark(Math.max(step.from, pos), Math.min(step.to, pos + node.nodeSize), formatChangeMark);
      }
    }
  });
};

export default addMarkStep;
