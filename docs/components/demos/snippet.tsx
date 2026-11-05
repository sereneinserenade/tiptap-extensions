'use client';
import { Snippet } from '@sereneinserenade/tiptap-extensions/snippet';
import { useState } from 'react';
import { Button, DemoFrame, EditorSurface, Input, Split, Toolbar, useDemoEditor } from './shared';

export function SnippetDemo() {
  const [snippets, setSnippets] = useState([
    { name: 'Signature', content: '<p>Best,<br>Jeet</p>' },
    { name: 'Checklist', content: '<h3>Before release</h3><ul><li><p>Tests pass</p></li><li><p>Changelog updated</p></li></ul>' },
  ]);
  const [name, setName] = useState('');
  const editor = useDemoEditor([Snippet], '<p>Drag a snippet from the right into this editor.</p><p></p>');

  const save = () => {
    if (!editor) return;
    setSnippets((s) => [...s, { name: name || `Snippet ${s.length + 1}`, content: editor.getHTML() }]);
    setName('');
  };

  return (
    <DemoFrame>
      <Toolbar>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Snippet name" aria-label="Snippet name" />
        <Button onClick={save}>Save editor as snippet</Button>
      </Toolbar>
      <Split>
        <EditorSurface editor={editor} />
        <ul className="flex flex-col gap-2">
          {snippets.map((s, i) => (
            <li
              key={i}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('snippet', s.content)}
              className="cursor-grab rounded-lg border bg-fd-background p-3 active:cursor-grabbing"
            >
              {s.name}
            </li>
          ))}
        </ul>
      </Split>
    </DemoFrame>
  );
}
