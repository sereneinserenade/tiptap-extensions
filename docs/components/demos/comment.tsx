'use client';
import { CommentExtension } from '@sereneinserenade/tiptap-extensions/comment';
import { useState } from 'react';
import { Button, DemoFrame, EditorSurface, Input, Split, Toolbar, useDemoEditor } from './shared';

export function CommentDemo() {
  const [threads, setThreads] = useState<{ id: string; text: string }[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [text, setText] = useState('');

  const editor = useDemoEditor(
    [CommentExtension.configure({ onCommentActivated: setActiveId })],
    '<p>Select any words in this paragraph, type a comment above and press <strong>Add comment</strong>. Click inside commented text to highlight its thread.</p>',
  );

  const add = () => {
    if (!editor || editor.state.selection.empty || !text.trim()) return;
    const id = `c${Date.now()}`;
    editor.chain().focus().setComment(id).run();
    setThreads((t) => [...t, { id, text: text.trim() }]);
    setActiveId(id);
    setText('');
  };

  const resolve = (id: string) => {
    editor?.commands.unsetComment(id);
    setThreads((t) => t.filter((c) => c.id !== id));
    setActiveId(null);
  };

  return (
    <DemoFrame>
      <Toolbar>
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Comment" aria-label="Comment text" className="flex-1" />
        <Button onClick={add}>Add comment</Button>
      </Toolbar>
      <Split>
        <EditorSurface editor={editor} />
        <ul className="flex flex-col gap-2">
          {threads.length === 0 && <li className="rounded-lg border border-dashed p-3 text-fd-muted-foreground">Select text and add a comment.</li>}
          {threads.map((c) => (
            <li key={c.id} className={`flex items-center justify-between gap-2 rounded-lg border bg-fd-background p-3 ${c.id === activeId ? 'border-fd-primary' : ''}`}>
              <span className="min-w-0 break-words">{c.text}</span>
              <Button onClick={() => resolve(c.id)}>Resolve</Button>
            </li>
          ))}
        </ul>
      </Split>
    </DemoFrame>
  );
}
