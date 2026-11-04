import { Editor } from '@tiptap/core';
import { NodeSelection, TextSelection } from '@tiptap/pm/state';
import { AddMarkStep, Mapping, RemoveMarkStep, ReplaceAroundStep, ReplaceStep } from '@tiptap/pm/transform';


import { findMark } from './findMark';
import { nowInMinutes } from '../utils/time';
import addMarkStep from './addMarkStep';
import removeMarkStep from './removeMarkStep';
import replaceAroundStep from './replaceAroundStep';
import replaceStep from './replaceStep';

export const trackedTransaction = (tr: Editor['state']['tr'], state: Editor['state'], user: any) => {
  // Don't track table operations

  if (!tr.selectionSet) {
    const $pos = state.selection.$anchor;

    for (let { depth } = $pos; depth > 0; depth -= 1) {
      const node = $pos.node(depth);

      if (node.type.spec.tableRole === 'table') {
        return tr;
      }
    }
  }

  const selection = state.selection as NodeSelection;

  if (selection.node && ['image', 'figure'].includes(selection.node.type.name)) {
    return tr;
  }

  if (
    !tr.steps.length ||
    ((tr as any).meta &&
      !Object.keys((tr as any).meta).every((meta) => ['inputType', 'uiEvent', 'paste'].includes(meta))) ||
    ['AcceptReject', 'Undo', 'Redo'].includes(tr.getMeta('inputType'))
  ) {
    return tr;
  }

  const newTr = state.tr;

  const map = new Mapping();

  const date = nowInMinutes();

  tr.steps.forEach((originalStep, originalStepIndex) => {
    const step = originalStep.map(map);

    const { doc } = newTr;

    if (!step) return;

    switch (step.constructor) {
      case ReplaceStep:
        replaceStep(
          state,
          tr,
          step as ReplaceStep,
          newTr,
          map,
          doc,
          user,
          date,
          originalStep as ReplaceStep,
          originalStepIndex
        );
        break;
      case ReplaceAroundStep:
        replaceAroundStep(
          state,
          tr,
          step as ReplaceAroundStep,
          newTr,
          map,
          doc,
          user,
          date,
          originalStep as ReplaceAroundStep,
          originalStepIndex
        );
        break;
      case AddMarkStep:
        addMarkStep(state, tr, step as AddMarkStep, newTr, map, doc, user, date);
        break;
      case RemoveMarkStep:
        removeMarkStep(state, tr, step as RemoveMarkStep, newTr, map, doc, user, date);
        break;
      default:
    }
  });

  if (tr.getMeta('inputType')) newTr.setMeta('inputType', tr.getMeta('inputType'));

  if (tr.getMeta('uiEvent')) newTr.setMeta('uiEvent', tr.getMeta('uiEvent'));

  if (tr.selectionSet) {
    const deletionMarkSchema = state.schema.marks.deletion;

    const deletionMark = findMark(state, deletionMarkSchema);

    if (
      tr.selection instanceof TextSelection &&
      (tr.selection.from < state.selection.from || tr.getMeta('inputType') === 'backwardsDelete')
    ) {
      const caretPos = map.map(tr.selection.from, -1);
      newTr.setSelection(new TextSelection(newTr.doc.resolve(caretPos)));
    } else if (tr.selection.from > state.selection.from && deletionMark) {
      const caretPos = map.map(deletionMark.to + 1, 1);
      newTr.setSelection(new TextSelection(newTr.doc.resolve(caretPos)));
    } else {
      newTr.setSelection(tr.selection.map(newTr.doc, map));
    }
  } else if (state.selection.from - tr.selection.from > 1 && tr.selection.$head.depth > 1) {
    const caretPos = map.map(tr.selection.from - 2, -1);
    newTr.setSelection(new TextSelection(newTr.doc.resolve(caretPos)));
  } else {
    if (
      state.selection.from === state.selection.to &&
      tr.selection.$head.depth > 1 &&
      state.selection.from - tr.selection.from === 1
    ) {
      tr.steps.forEach((originalStep, index) => {
        const step = originalStep.map(map) as any;

        step.from += 1;

        step.to += 1;

        const { doc } = newTr;

        replaceStep(state, tr, step, newTr, map, doc, user, date, originalStep as ReplaceStep, index);
      });
      const caretPos = map.map(tr.selection.from - 1, -1);
      newTr.setSelection(new TextSelection(newTr.doc.resolve(caretPos)));
    } else if (state.selection.from === state.selection.to) {
      const caretPos = map.map(tr.selection.from, -1);
      newTr.setSelection(new TextSelection(newTr.doc.resolve(caretPos)));
    }
    const slice = map.slice(newTr.selection.from, newTr.selection.to);

    map.appendMap(slice as any);
  }

  if (tr.storedMarksSet) newTr.setStoredMarks(tr.storedMarks);

  if (tr.scrolledIntoView) newTr.scrollIntoView();

  return newTr;
};
