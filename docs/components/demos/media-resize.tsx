'use client';
import { ResizableMedia } from '@sereneinserenade/tiptap-extensions/media-resize';
import { useState } from 'react';
import { Button, DemoFrame, EditorSurface, Input, Toolbar, useDemoEditor } from './shared';

const IMAGE = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200';

export function MediaResizeDemo() {
  const [url, setUrl] = useState(IMAGE);
  const editor = useDemoEditor(
    [ResizableMedia],
    `<p>Click the image to show its toolbar. Drag the right or bottom edge to resize.</p><img src="${IMAGE}" alt="Mountains" width="360"><p>Floated media lets text wrap around it. Try "Float left" and watch this paragraph move next to the image.</p>`,
  );

  const insert = (type: 'img' | 'video', width: number) => url && editor?.chain().focus().setMedia({ 'media-type': type, src: url, width }).run();

  return (
    <DemoFrame>
      <Toolbar>
        <Input value={url} onChange={(e) => setUrl(e.target.value)} aria-label="Media URL" className="flex-1 basis-56" />
        <Button onClick={() => insert('img', 320)}>Insert image</Button>
        <Button onClick={() => insert('video', 360)}>Insert video</Button>
      </Toolbar>
      <EditorSurface editor={editor} />
    </DemoFrame>
  );
}
