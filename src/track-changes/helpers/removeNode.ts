import { replaceStep } from '@tiptap/pm/transform';
import { Selection } from '@tiptap/pm/state';
import { Editor } from '@tiptap/core';

const removeNode = (
  tr: Editor['state']['tr'],
  node: Editor['state']['doc'],
  nodePos: number,
  map: Editor['state']['tr']['mapping']
) => {
  const newNodePos = map.map(nodePos);

  const selectionBefore = Selection.findFrom(tr.doc.resolve(newNodePos), -1)!;

  const start = selectionBefore.$anchor.pos;

  const end = newNodePos + 1;

  const delStep = replaceStep(tr.doc, start, end)!;

  tr.step(delStep);

  const stepMap = delStep.getMap();

  map.appendMap(stepMap);
};

export default removeNode;
