import { Editor } from '@tiptap/core';
import { Node as PMNode } from '@tiptap/pm/model';

const markWrapping = (
  tr: Editor['state']['tr'],
  pos: number,
  oldNode: PMNode,
  newNode: PMNode,
  user: any,
  date: number
) => {
  let track = oldNode.attrs.track.slice();

  let blockTrack = track.find((t: any) => t.type === 'blockChange');

  if (blockTrack) {
    track = track.filter((t: any) => t !== blockTrack);

    if (blockTrack.before.type !== newNode.type.name || blockTrack.before.attrs.level !== newNode.attrs.level) {
      blockTrack = {
        type: 'blockChange',
        user: user,
        date,
        before: blockTrack.before,
      };
      track.push(blockTrack);
    }
  } else {
    blockTrack = {
      type: 'blockChange',
      user: user,
      date,
      before: { type: oldNode.type.name, attrs: oldNode.attrs },
    };
    if (blockTrack.before.attrs.id) {
      delete blockTrack.before.attrs.id;
    }
    if (blockTrack.before.attrs.track) {
      delete blockTrack.before.attrs.track;
    }
    track.push(blockTrack);
  }

  tr.setNodeMarkup(pos, null, { ...newNode.attrs, track });
};

export default markWrapping;
