'use client';
import { LanguageTool } from '@sereneinserenade/tiptap-extensions/languagetool';
import { useEditorState } from '@tiptap/react';
import { Button, DemoFrame, EditorSurface, Split, Toolbar, useDemoEditor } from './shared';

export function LanguageToolDemo() {
  const editor = useDemoEditor(
    [
      LanguageTool.configure({
        language: 'en-US',
        // the public API allows about 20 requests a minute, point this at your own server
        apiUrl: 'https://api.languagetool.org/v2/check',
        debounceMs: 1000,
      }),
    ],
    '<p>This are a example of a sentense with some mistaks in it.</p><p>Hover or click a underlined word to see suggestions.</p>',
  );

  const state = useEditorState({
    editor,
    selector: ({ editor }) => {
      const s = editor?.storage.languagetool;
      return { match: s?.match, status: !s?.active ? 'Off' : s.loading ? 'Checking…' : '' };
    },
  });

  return (
    <DemoFrame>
      <Toolbar>
        <Button onClick={() => editor?.commands.proofread()}>Check again</Button>
        <Button onClick={() => editor?.commands.toggleLanguageTool()}>Toggle on/off</Button>
        <span className="text-fd-muted-foreground">{state?.status}</span>
      </Toolbar>
      <Split>
        <EditorSurface editor={editor} />
        <div className="rounded-lg border bg-fd-background p-3" aria-live="polite">
          {state?.match ? (
            <>
              <p className="mb-3">{state.match.message}</p>
              <div className="flex flex-wrap gap-2">
                {state.match.replacements.slice(0, 5).map((r) => (
                  <Button key={r.value} onClick={() => editor?.chain().focus().acceptLanguageToolSuggestion(r.value).run()}>{r.value}</Button>
                ))}
                <Button onClick={() => editor?.commands.ignoreLanguageToolSuggestion()}>Ignore</Button>
              </div>
            </>
          ) : (
            <p className="text-fd-muted-foreground">Hover or click an underlined word.</p>
          )}
        </div>
      </Split>
    </DemoFrame>
  );
}
