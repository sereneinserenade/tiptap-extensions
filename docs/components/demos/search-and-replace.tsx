'use client';
import { SearchAndReplace } from '@sereneinserenade/tiptap-extensions/search-and-replace';
import { useEditorState } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';
import { Button, Checkbox, DemoFrame, EditorSurface, Input, Toolbar, useDemoEditor } from './shared';

const initial = '<p>The cat sat. A Cat ran. The cot was empty.</p><p>Search for <code>cat</code>, or turn on regex and try <code>c.t</code>.</p>';

export function SearchAndReplaceDemo() {
  const [search, setSearch] = useState('');
  const [replace, setReplace] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [regex, setRegex] = useState(false);
  const html = useRef(initial);

  // regex is an extension option, so toggling it recreates the editor
  const editor = useDemoEditor([SearchAndReplace.configure({ disableRegex: !regex })], html.current, [regex]);

  useEffect(() => {
    if (!editor) return;
    const save = () => (html.current = editor.getHTML());
    editor.on('update', save);
    return () => void editor.off('update', save);
  }, [editor]);

  useEffect(() => {
    editor?.chain().setSearchTerm(search).setCaseSensitive(caseSensitive).resetIndex().run();
  }, [editor, search, caseSensitive]);

  useEffect(() => {
    editor?.commands.setReplaceTerm(replace);
  }, [editor, replace]);

  const count = useEditorState({
    editor,
    selector: ({ editor }) => {
      // storage is gone while the regex toggle swaps editors
      const storage = editor?.storage.searchAndReplace;
      if (!storage) return '';
      const { results, resultIndex } = storage;
      return results.length ? `${resultIndex + 1} of ${results.length}` : 'No results';
    },
  });

  return (
    <DemoFrame>
      <Toolbar>
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" aria-label="Search" />
        <Input value={replace} onChange={(e) => setReplace(e.target.value)} placeholder="Replace" aria-label="Replace" />
        <Checkbox label="Case sensitive" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} />
        <Checkbox label="Regex" checked={regex} onChange={(e) => setRegex(e.target.checked)} />
      </Toolbar>
      <Toolbar>
        <Button onClick={() => editor?.commands.previousSearchResult()}>Previous</Button>
        <Button onClick={() => editor?.commands.nextSearchResult()}>Next</Button>
        <Button onClick={() => editor?.commands.replace()}>Replace</Button>
        <Button onClick={() => editor?.commands.replaceAll()}>Replace all</Button>
        <span className="text-fd-muted-foreground" aria-live="polite">{count}</span>
      </Toolbar>
      <EditorSurface editor={editor} />
    </DemoFrame>
  );
}
