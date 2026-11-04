import { Selection } from '@tiptap/pm/state';
import { replaceStep } from '@tiptap/pm/transform';

import { Editor } from '@tiptap/core';

export const removeNode = (
  tr: Editor['state']['tr'],
  node: Editor['state']['doc'],
  nodePos: number,
  mapping: Editor['state']['tr']['mapping']
) => {
  const mappedNodePos = mapping.map(nodePos);
  const $mappedNodePos = tr.doc.resolve(mappedNodePos);

  const selectionBefore = Selection.findFrom($mappedNodePos, -1)!;

  const start = selectionBefore.$anchor.pos;

  const end = mappedNodePos + 1; // TODO: should this be +1 or mappedNodePos + node.nodeSize?

  const delStep = replaceStep(tr.doc, start, end)!;

  tr.step(delStep);

  mapping.appendMap(delStep.getMap());
};

export default removeNode;
