import { Selection, TextSelection } from '@tiptap/pm/state';
import { Slice } from '@tiptap/pm/model';
import { ReplaceStep, Mapping } from '@tiptap/pm/transform';
import { Editor } from '@tiptap/core';

const markDeletion = (tr: Editor['state']['tr'], from: number, to: number, user: any, date: number) => {
  const deletionMark = tr.doc.type.schema.marks.deletion.create({
    user,
    createdAt: date,
  });

  const deletionMap = new Mapping();

  tr.doc.nodesBetween(from, to, (node, pos) => {
    if (node.type.name.includes('table')) return;

    if (node.isInline && node.marks.find((mark) => mark.type.name === 'insertion')) {
      const removeStep = new ReplaceStep(
        deletionMap.map(Math.max(from, pos)),
        deletionMap.map(Math.min(to, pos + node.nodeSize)),
        Slice.empty
      );

      if (!tr.maybeStep(removeStep).failed) {
        deletionMap.appendMap(removeStep.getMap());
      }

      return;
    }

    if (node.isInline && !node.marks.find((mark) => mark.type.name === 'deletion')) {
      if (node.type.name !== 'text') {
        const track = structuredClone(node.attrs.track);

        track.push({
          type: 'deletion',
          user,
          createdAt: date,
        });

        tr.setNodeAttribute(pos, 'track', track);
      }

      tr.addMark(
        deletionMap.map(Math.max(from, pos)),
        deletionMap.map(Math.min(to, pos + node.nodeSize)),
        deletionMark
      );

      return;
    }

    if (
      node.attrs.track &&
      !node.attrs.track.find((trackAttr: any) => trackAttr.type === 'deletion') &&
      pos >= from

      // ! why should we exclude bulletList and orderedList?
      // !['bulletList', 'orderedList'].includes(node.type.name)
    ) {
      if (node.attrs.track.find((trackAttr: any) => trackAttr.type === 'insertion' && trackAttr.user.id === user.id)) {
        let removeStep: ReplaceStep;

        if (node.isTextblock && to < pos + node.nodeSize) {
          const selectionBefore = Selection.findFrom(tr.doc.resolve(pos), -1);
          if (selectionBefore instanceof TextSelection) {
            removeStep = new ReplaceStep(
              deletionMap.map(selectionBefore.$anchor.pos),
              deletionMap.map(to),
              Slice.empty
            );
          }
        } else {
          removeStep = new ReplaceStep(
            deletionMap.map(Math.max(from, pos)),
            deletionMap.map(Math.min(to, pos + node.nodeSize)),
            Slice.empty
          );
        }

        if (removeStep! && !tr.maybeStep(removeStep).failed) {
          deletionMap.appendMap(removeStep.getMap());
        }
      }

      let counter = 2;

      node.content.forEach((item) => {
        item.marks.forEach((mark) => {
          if (mark.type.name === 'deletion') {
            counter += item.nodeSize;
          }
        });
      });

      if (node.content.size === 0 || counter === node.nodeSize) {
        const track = structuredClone(node.attrs.track);

        track.push({
          type: 'deletion',
          user,
          createdAt: date,
        });

        tr.setNodeMarkup(deletionMap.map(pos), null, Object.assign(node.attrs.track, { track }), node.marks);
      }
    }
  });

  return deletionMap;
};

export default markDeletion;
