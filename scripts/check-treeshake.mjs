// Bundles one import at a time from the built package and fails if code from another extension leaks in.
import { build } from 'esbuild'

const extensions = {
  CommentExtension: 'comment',
  SearchAndReplace: 'searchAndReplace',
  InlineSuggestion: 'inlineSuggestion',
  TiptapAutocomplete: 'tiptapAutocomplete',
  Video: 'videoDrop',
  Snippet: 'isSnippetDropTransaction',
  LanguageTool: 'api.languagetool.org',
  ResizableMedia: 'media-node-view',
  TrackChangesKit: 'trackChangesKit',
}

let failed = false

for (const [name, marker] of Object.entries(extensions)) {
  const result = await build({
    stdin: { contents: `export { ${name} } from '@sereneinserenade/tiptap-extensions'`, resolveDir: process.cwd(), loader: 'js' },
    bundle: true,
    write: false,
    minify: true,
    format: 'esm',
    external: ['@tiptap/*'],
    alias: { '@sereneinserenade/tiptap-extensions': './dist/index.js' },
  })

  const code = result.outputFiles[0].text
  const leaks = Object.entries(extensions).filter(([other, m]) => other !== name && code.includes(`"${m}"`) && m !== marker)

  if (!code.includes(marker)) {
    console.error(`✗ ${name}: marker "${marker}" missing, the check itself is broken`)
    failed = true
  } else if (leaks.length) {
    console.error(`✗ ${name} pulls in ${leaks.map(([n]) => n).join(', ')}`)
    failed = true
  } else {
    console.log(`✓ ${name.padEnd(20)} ${(code.length / 1024).toFixed(1)} KB minified`)
  }
}

process.exit(failed ? 1 : 0)
