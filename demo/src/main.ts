import './style.css'
import { h } from './editor'
import { autocompleteDemo } from './demos/autocomplete'
import { commentDemo } from './demos/comment'
import { inlineSuggestionDemo } from './demos/inline-suggestion'
import { languageToolDemo } from './demos/languagetool'
import { mediaResizeDemo } from './demos/media-resize'
import { searchAndReplaceDemo } from './demos/search-and-replace'
import { snippetDemo } from './demos/snippet'
import { trackChangesDemo } from './demos/track-changes'
import type { Demo } from './demos/types'
import { videoDemo } from './demos/video'

const demos: Demo[] = [
  commentDemo,
  searchAndReplaceDemo,
  trackChangesDemo,
  languageToolDemo,
  mediaResizeDemo,
  inlineSuggestionDemo,
  autocompleteDemo,
  videoDemo,
  snippetDemo,
]

const app = document.getElementById('app')!
const nav = document.getElementById('nav')!
let cleanup = () => {}

const code = (text: string) => h('pre', {}, h('code', {}, text))

const home = () => [
  h('h1', {}, 'Tiptap extensions'),
  h('p', { className: 'lead' }, 'Nine Tiptap 3 extensions in one tree-shakable package. Import only what you use, the rest never reaches your bundle.'),
  code('npm i @sereneinserenade/tiptap-extensions'),
  h('div', { className: 'cards' }, ...demos.map((d) => h('a', { className: 'card', href: `#/${d.id}` }, h('strong', {}, d.title), h('span', {}, d.summary)))),
]

const route = () => {
  cleanup()
  cleanup = () => {}
  app.replaceChildren()

  const id = location.hash.replace(/^#\/?/, '')
  const demo = demos.find((d) => d.id === id)

  nav.querySelectorAll('a').forEach((a) => a.toggleAttribute('aria-current', a.getAttribute('href') === `#/${id}`))

  if (!demo) {
    app.append(...home())
    document.title = 'Tiptap extensions'
    return
  }

  document.title = `${demo.title} · Tiptap extensions`
  const stage = h('section', { className: 'stage' })
  app.append(
    h('h1', {}, demo.title),
    h('p', { className: 'lead' }, demo.summary),
    stage,
    h('h2', {}, 'Usage'),
    code(`import { ${demo.importName} } from '@sereneinserenade/tiptap-extensions/${demo.id}'`),
  )
  cleanup = demo.mount(stage)
}

nav.append(...demos.map((d) => h('a', { href: `#/${d.id}` }, d.title)))
window.addEventListener('hashchange', route)
route()
