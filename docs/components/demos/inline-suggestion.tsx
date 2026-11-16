'use client';
import { InlineSuggestion } from '@sereneinserenade/tiptap-extensions/inline-suggestion';
import { DemoFrame, EditorSurface, Hint, useDemoEditor } from './shared';

const endings = [' and that is how the story ends.', ', which nobody expected.', ' right before lunch.'];
let i = 0;

export function InlineSuggestionDemo() {
  const editor = useDemoEditor(
    // replace with a call to your model
    [InlineSuggestion.configure({ fetchAutocompletion: async () => endings[i++ % endings.length] })],
    '<p>Put the cursor at the end of this line and press Tab</p>',
  );

  return (
    <DemoFrame>
      <Hint>Tab fetches, Tab accepts, any other key dismisses.</Hint>
      <EditorSurface editor={editor} />
    </DemoFrame>
  );
}
