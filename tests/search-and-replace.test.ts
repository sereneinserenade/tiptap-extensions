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

  it('treats the term as a regex only when enabled', () => {
    const editor = createEditor([SearchAndReplace.configure({ disableRegex: false })], '<p>cat cot c.t</p>')
    editor.commands.setSearchTerm('c.t')
    expect(editor.storage.searchAndReplace.results).toHaveLength(3)

    const literal = createEditor([SearchAndReplace], '<p>cat cot c.t</p>')
    literal.commands.setSearchTerm('c.t')
    expect(literal.storage.searchAndReplace.results).toHaveLength(1)
  })
})

describe('search-and-replace current result', () => {
  it('replaces the current result, not the first (issue #10)', () => {
    const editor = createEditor([SearchAndReplace], '<p>cat cat cat</p>')
    editor.commands.setSearchTerm('cat')
    editor.commands.setReplaceTerm('X')
    editor.commands.nextSearchResult()
    editor.commands.replace()
    expect(editor.getText()).toBe('cat X cat')
  })

  it('wraps the index after replacing the last result (issue #11)', () => {
    const editor = createEditor([SearchAndReplace], '<p>cat cat cat</p>')
    editor.commands.setSearchTerm('cat')
    editor.commands.setReplaceTerm('X')
    editor.commands.previousSearchResult()
    expect(editor.storage.searchAndReplace.resultIndex).toBe(2)

    editor.commands.replace()
    expect(editor.getText()).toBe('cat cat X')
    expect(editor.storage.searchAndReplace.resultIndex).toBe(0)
    expect(editor.view.dom.querySelectorAll('.search-result-current')).toHaveLength(1)
  })
})
