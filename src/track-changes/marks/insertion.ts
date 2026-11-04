import { Mark, mergeAttributes } from '@tiptap/core';

export const Insertion = Mark.create({
  name: 'insertion',

  inclusive: false,

  addAttributes() {
    return {
      class: {
        default: 'ins',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span.ins',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes({}, HTMLAttributes), 0];
  },
});
