# @sereneinserenade/tiptap-extensions

Nine [Tiptap 3](https://tiptap.dev) extensions in one tree-shakable package. Import what you use and nothing else reaches your bundle. No framework dependency, so they work with React, Vue, Svelte or plain JS.

**[Live demos](https://sereneinserenade.github.io/tiptap-extensions/)**

```bash
npm i @sereneinserenade/tiptap-extensions
```

```ts
import { CommentExtension } from '@sereneinserenade/tiptap-extensions/comment'
// or, same bundle size thanks to tree-shaking
import { CommentExtension } from '@sereneinserenade/tiptap-extensions'
```

| Extension | Import path | What it does |
| --- | --- | --- |
| `CommentExtension` | `/comment` | Google Docs style comment marks keyed by an id |
| `SearchAndReplace` | `/search-and-replace` | Find, step through and replace, with case and opt-in regex (`disableRegex: false`) |
| `TrackChangesKit` | `/track-changes` | Word style suggestions with accept and reject |
| `LanguageTool` | `/languagetool` | Grammar and spell checking via a LanguageTool server |
| `ResizableMedia` | `/media-resize` | Resize, align, float and delete images and videos |
| `InlineSuggestion` | `/inline-suggestion` | Ghost text suggestions, Tab to fetch and accept |
| `TiptapAutocomplete` | `/autocomplete` | Type `/` to fill text between what comes before and after |
| `Video` | `/video` | Video node with URL, markdown and file drop insertion |
| `Snippet` | `/snippet` | Drag saved HTML snippets into the editor |

Each demo page shows the code it runs, see [`demo/src/demos`](demo/src/demos).

## Styling

The extensions render plain class names and attributes and ship no CSS. Style these:

- comment: `span[data-comment-id]`
- search and replace: `.search-result`, `.search-result-current`
- track changes: `.ins`, `.del`, `.formatChange`
- languagetool: `.lt` and `.lt-<issueType>`, e.g. `.lt-misspelling`, `.lt-grammar`
- inline suggestion: `[data-inline-suggestion]::after { content: attr(data-inline-suggestion) }`
- autocomplete: `.autocomplete-suggestion::after { content: attr(data-autocomplete) }`
- media resize: `.media-node-view`, `.media-node-view__toolbar`, `.media-node-view__handle`

[`demo/src/style.css`](demo/src/style.css) has a working set.

## Coming from the single packages

The old `@sereneinserenade/tiptap-*` packages keep working. To switch, change the import path. Differences:

- Tiptap 3 only. Stay on the old packages for Tiptap 2.
- Named exports only, no default exports.
- `SearchAndReplace` fixes `replace` acting on the first result instead of the current one, and the index staying past the end after replacing the last result.
- `SnippetExtension` is now `Snippet` and reads the `snippet` drag data type by default.
- `LanguageTool` no longer bundles Dexie or lodash. Pass `isIgnored` and `onIgnore` to persist ignored words, and use `acceptLanguageToolSuggestion(text)` to apply a fix. The default `apiUrl` is the public LanguageTool API.
- `ResizableMedia` no longer needs Vue. The toolbar and resize handles are plain DOM.
- `TrackChanges` takes a `types` option for the block nodes it tracks, and users may set `name` instead of `first_name` and `last_name`.

## Development

```bash
npm i
npm run demo              # demo site with live reload
npm test                  # vitest
npm run build             # dist via tsup
npm run check:treeshake   # proves each export bundles alone
npm run check:types       # type resolution across Node and bundler setups
```

## License

MIT
