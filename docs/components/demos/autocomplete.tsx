'use client';
import { TiptapAutocomplete } from '@sereneinserenade/tiptap-extensions/autocomplete';
import { DemoFrame, EditorSurface, Hint, useDemoEditor } from './shared';

export function AutocompleteDemo() {
  const editor = useDemoEditor(
    [
      TiptapAutocomplete.configure({
        // replace with a call to your model, both sides of the cursor are passed in
        fetchAutoCompleteSuggestion: async ({ contextBefore }) => (contextBefore.trim().endsWith('Dear') ? ' team,' : ' hope this finds you well'),
      }),
    ],
    '<p>Dear </p><p>I </p>',
  );

  return (
    <DemoFrame>
      <Hint>Type / after &quot;Dear&quot; or &quot;I&quot;. Tab accepts, Escape rejects.</Hint>
      <EditorSurface editor={editor} />
    </DemoFrame>
  );
}
