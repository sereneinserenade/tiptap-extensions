'use client';
import { TrackChangesKit } from '@sereneinserenade/tiptap-extensions/track-changes';
import { useEditorState } from '@tiptap/react';
import { useEffect } from 'react';
import { Button, DemoFrame, EditorSurface, Select, Toolbar, useDemoEditor } from './shared';

const users = [
  { id: 1, name: 'Ada' },
  { id: 2, name: 'Grace' },
];

export function TrackChangesDemo() {
  const editor = useDemoEditor([TrackChangesKit], '<p>Tracking is on. Type, delete or bold some words in this sentence, then accept or reject the changes.</p>');

  useEffect(() => {
    editor?.chain().setCurrentUser(users[0]).setTrackChangesActive(true).run();
  }, [editor]);

  const active = useEditorState({ editor, selector: ({ editor }) => editor?.storage.trackChanges?.isActive ?? false });
  const whole = () => ({ from: 0, to: editor!.state.doc.content.size });

  return (
    <DemoFrame>
      <Toolbar>
        <Button onClick={() => editor?.commands.toggleTrackChangesActive()} aria-pressed={!!active}>
          Tracking: {active ? 'on' : 'off'}
        </Button>
        <Select aria-label="Current user" onChange={(e) => editor?.commands.setCurrentUser(users.find((u) => `${u.id}` === e.target.value)!)}>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </Select>
        <Button onClick={() => editor?.chain().focus().toggleBold().run()}>Bold</Button>
      </Toolbar>
      <Toolbar>
        <Button onClick={() => editor?.chain().focus().acceptChanges().run()}>Accept selection</Button>
        <Button onClick={() => editor?.chain().focus().rejectChanges().run()}>Reject selection</Button>
        <Button onClick={() => editor?.commands.acceptChanges(whole())}>Accept all</Button>
        <Button onClick={() => editor?.commands.rejectChanges(whole())}>Reject all</Button>
      </Toolbar>
      <EditorSurface editor={editor} />
    </DemoFrame>
  );
}
