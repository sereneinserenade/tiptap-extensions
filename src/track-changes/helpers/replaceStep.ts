import { ReplaceStep } from '@tiptap/pm/transform';
import { Editor } from '@tiptap/core';

import { findMark } from './findMark';
import markDeletion from './markDeletion';
import markInsertion from './markInsertion';

const replaceStep = (
  state: Editor['state'],
  tr: Editor['state']['tr'],
  step: ReplaceStep,
  newTr: Editor['state']['tr'],
  map: Editor['state']['tr']['mapping'],
  doc: Editor['state']['doc'],
  user: any,
  date: number,
  originalStep: ReplaceStep,
  originalStepIndex: number
) => {
  const deletionMarkSchema = state.schema.marks.deletion;

  const deletionMark = findMark(state, deletionMarkSchema);

  const positionTo = deletionMark ? deletionMark.to : step.to;

  const newStep = new ReplaceStep(
    positionTo, // We insert all the same steps, but with "from"/"to" both set to "to" in order not to delete content. Mapped as needed.
    positionTo,
    step.slice,
    (step as any).structure
  );

  // We didn't apply the original step in its original place. We adjust the map accordingly.
  const invertStep = originalStep.invert(tr.docs[originalStepIndex]).map(map)!;

  map.appendMap(invertStep.getMap());
  // map.appendMap(step.invert(doc).getMap());
  if (newStep) {
    const trTemp = state.apply(newTr).tr;
    if (trTemp.maybeStep(newStep).failed) {
      return;
    }
    const mappedNewStepTo = newStep.getMap().map(newStep.to);

    markInsertion(trTemp, newStep.from, mappedNewStepTo, user, date);
    // We condense it down to a single replace step.
    const condensedStep = new ReplaceStep(newStep.from, newStep.to, trTemp.doc.slice(newStep.from, mappedNewStepTo));

    newTr.step(condensedStep);
    const mirrorIndex = map.maps.length - 1;
    map.appendMap(condensedStep.getMap(), mirrorIndex);
    if (!newTr.selection.eq(trTemp.selection)) {
      newTr.setSelection(trTemp.selection);
    }
  }
  if (step.from !== step.to) {
    map.appendMap(markDeletion(newTr, step.from, step.to, user, date) as any);
  }
};

export default replaceStep;
