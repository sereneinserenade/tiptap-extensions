import { Mark, mergeAttributes } from '@tiptap/core';

export const FormatChange = Mark.create({
  name: 'formatChange',

  inclusive: false,

  addAttributes() {
    return {
      class: {
        default: 'formatChange',
      },
      before: {
        default: [],
      },
      after: {
        default: [],
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span.formatChange',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes({}, HTMLAttributes), 0];
  },
});
