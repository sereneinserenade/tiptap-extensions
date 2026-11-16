import { Extension } from '@tiptap/core'

import { Deletion, FormatChange, Insertion } from './marks'
import { TrackChanges } from './trackChanges'
import type { TrackChangesOptions } from './trackChanges'

export interface TrackChangesKitOptions {
  /** Options for the `TrackChanges` extension, or `false` to leave it out. */
  trackChanges: Partial<TrackChangesOptions> | false
}

/** The `TrackChanges` extension plus the `insertion`, `deletion` and `formatChange` marks it writes. */
export const TrackChangesKit = Extension.create<TrackChangesKitOptions>({
  name: 'trackChangesKit',

  addOptions() {
    return { trackChanges: {} }
  },

  addExtensions() {
    const { trackChanges } = this.options

    return [
      ...(trackChanges === false ? [] : [TrackChanges.configure(trackChanges)]),
      Insertion,
      Deletion,
      FormatChange,
    ]
  },
})
