import { Editor } from '@tiptap/core';


const markInsertion = (
  tr: Editor['state']['tr'],
  from: number,
  to: number,
  user: any,
  date: number
) => {
  tr.removeMark(from, to, tr.doc.type.schema.marks.deletion);
  tr.removeMark(from, to, tr.doc.type.schema.marks.insertion);

  const insertionMark = tr.doc.type.schema.marks.insertion.create({
    user,
    createdAt: date,
  });

  tr.addMark(from, to, insertionMark);

  // Add insertion mark also to block nodes (figures, text blocks) but not table cells/rows and lists.
  tr.doc.nodesBetween(from, to, (node, pos) => {
    if (pos < from || ['bulletList', 'orderedList'].includes(node.type.name)) {
      return true;
    }

    if (['tableRow', 'tableCell'].includes(node.type.name)) {
      return false;
    }

    const track = [];

    track.push({
      type: 'insertion',
      user,
      createdAt: date,
    });

    if (node.type.name === 'table') {
      // A table was inserted. We don't add track marks to elements inside of it.
      return false;
    }

    if (node.type.name !== 'text') {
      tr.setNodeMarkup(pos, null, { ...node.attrs, track }, node.marks);
    }
  });
};

export default markInsertion;
