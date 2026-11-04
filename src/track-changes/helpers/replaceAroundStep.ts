import { Editor } from '@tiptap/core';

import markDeletion from './markDeletion';
import markInsertion from './markInsertion';
import markWrapping from './markWrapping';
import { ReplaceAroundStep } from '@tiptap/pm/transform';

const replaceAroundStep = (
  state: Editor['state'],
  tr: Editor['state']['tr'],
  step: ReplaceAroundStep,
  newTr: Editor['state']['tr'],
  map: Editor['state']['tr']['mapping'],
  doc: Editor['state']['doc'],
  user: any,
  date: number,
  originalStep: ReplaceAroundStep,
  originalStepIndex: number
) => {
  if (step.from === step.gapFrom && step.to === step.gapTo) {
    // wrapped in something
    newTr.step(step);
    const from = step.getMap().map(step.from, -1);
    const to = step.getMap().map(step.gapFrom);
    markInsertion(newTr, from, to, user, date);
  } else if (!step.slice.size || (step.slice.content as any).content.length === 2) {
    const invertStep = originalStep.invert(tr.docs[originalStepIndex]).map(map)!;
    // unwrapped from something
    map.appendMap(invertStep.getMap());
    // map.appendMap(step.invert(doc).getMap());
    map.appendMap(markDeletion(newTr, step.from, step.gapFrom, user, date) as any);
  } else if (step.slice.size === 2 && step.gapFrom - step.from === 1 && step.to - step.gapTo === 1) {
    // Replaced one wrapping with another
    newTr.step(step);
    const oldNode = doc.nodeAt(step.from)!;

    if (oldNode.attrs.track) {
      markWrapping(newTr, step.from, oldNode, step.slice.content.firstChild!, user, date);
    }
  } else {
    newTr.step(step);
    const ranges = [
      {
        from: step.getMap().map(step.from, -1),
        to: step.getMap().map(step.gapFrom),
      },
      {
        from: step.getMap().map(step.gapTo, -1),
        to: step.getMap().map(step.to),
      },
    ];
    ranges.forEach((range) =>
      doc.nodesBetween(range.from, range.to, (node, pos) => {
        if (pos < range.from) {
          return true;
        }
        markInsertion(newTr, range.from, range.to, user, date);
      })
    );
  }
};

export default replaceAroundStep;
