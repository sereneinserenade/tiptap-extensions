'use client';
import { Video } from '@sereneinserenade/tiptap-extensions/video';
import { useState } from 'react';
import { Button, DemoFrame, EditorSurface, Input, Toolbar, useDemoEditor } from './shared';

const SAMPLE = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

export function VideoDemo() {
  const [url, setUrl] = useState(SAMPLE);
  const editor = useDemoEditor([Video], `<p>Drop a video file here or use the button.</p><video src="${SAMPLE}"></video><p></p>`);

  return (
    <DemoFrame>
      <Toolbar>
        <Input value={url} onChange={(e) => setUrl(e.target.value)} aria-label="Video URL" className="flex-1 basis-56" />
        <Button onClick={() => url && editor?.chain().focus().setVideo(url).run()}>Insert video</Button>
      </Toolbar>
      <EditorSurface editor={editor} />
    </DemoFrame>
  );
}
