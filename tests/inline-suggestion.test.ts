import { describe, expect, it } from 'vitest'
import { InlineSuggestion } from '../src/inline-suggestion'
import { createEditor, tick } from './helpers'

describe('inline-suggestion', () => {
  it('shows a fetched suggestion and inserts it on the next fetch', async () => {
    const editor = createEditor([InlineSuggestion.configure({ fetchAutocompletion: async () => ' there' })], '<p>Hello</p>')

    editor.chain().focus('end').fetchSuggestion().run()
    await tick()

    expect(editor.view.dom.querySelector('[data-inline-suggestion=" there"]')).not.toBeNull()

    editor.commands.fetchSuggestion()
    await tick(50)

    expect(editor.getText()).toBe('Hello there')
  })
})
