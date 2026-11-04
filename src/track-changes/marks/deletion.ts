import { Mark, mergeAttributes } from '@tiptap/core';

export const Deletion = Mark.create({
  name: 'deletion',

  inclusive: false,

  addAttributes() {
    return {
      class: {
        default: 'del',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span.del',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes({}, HTMLAttributes), 0];
  },
});
