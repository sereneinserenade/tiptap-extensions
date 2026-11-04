import { describe, expect, it } from 'vitest'
import { SearchAndReplace } from '../src/search-and-replace'
import { createEditor } from './helpers'

describe('search-and-replace', () => {
  it('finds and replaces all matches', () => {
    const editor = createEditor([SearchAndReplace], '<p>cat dog cat</p><p>Cat</p>')

    editor.commands.setSearchTerm('cat')
    expect(editor.storage.searchAndReplace.results).toHaveLength(3)

    editor.commands.setCaseSensitive(true)
    expect(editor.storage.searchAndReplace.results).toHaveLength(2)

    editor.chain().setReplaceTerm('bird').replaceAll().run()
    expect(editor.getText()).toBe('bird dog bird\n\nCat')
  })
})
