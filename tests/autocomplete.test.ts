import { describe, expect, it, vi } from 'vitest'
import { TiptapAutocomplete } from '../src/autocomplete'
import { createEditor, tick } from './helpers'

describe('autocomplete', () => {
  it('passes context around the slash and applies the suggestion', async () => {
    const fetchAutoCompleteSuggestion = vi.fn(async () => ' brave new')
    const editor = createEditor([TiptapAutocomplete.configure({ fetchAutoCompleteSuggestion })], '<p>Hello world</p>')

    // what the `/` shortcut does: fetch, then let the browser type the slash
    editor.commands.setTextSelection(6)
    editor.commands.fetchAutoCompleteSuggestion()
    editor.commands.insertContent('/')
    await tick(10)

    expect(fetchAutoCompleteSuggestion).toHaveBeenCalledWith({ contextBefore: 'Hello', contextAfter: ' world' })
    expect(editor.view.dom.querySelector('[data-autocomplete=" brave new"]')).not.toBeNull()

    editor.commands.applySuggestion()
    expect(editor.getText()).toBe('Hello brave new world')
  })
})
