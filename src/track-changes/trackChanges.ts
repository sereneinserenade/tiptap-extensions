import { Extension } from '@tiptap/core'
import type { Editor } from '@tiptap/core'

import { acceptTrackChange, rejectTrackChange } from './actions'
import { trackedTransaction } from './helpers'
import { formatTrackDate, getTrackAttributes, getUserName } from './utils'
import type { TrackChangesUser } from './utils'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    trackChanges: {
      toggleTrackChangesActive: () => ReturnType
      setTrackChangesActive: (isActive: boolean) => ReturnType
      setCurrentUser: (user: TrackChangesUser) => ReturnType
      /** Accept tracked changes in `range`, or in the selection. */
      acceptChanges: (range?: Range) => ReturnType
      /** Reject tracked changes in `range`, or in the selection. */
      rejectChanges: (range?: Range) => ReturnType
    }
  }

  interface Storage {
    trackChanges: TrackChangesStorage
  }
}

export interface TrackChangesOptions {
  /** Block node types that get a `track` attribute so block-level changes are tracked. */
  types: string[]
}

export interface TrackChangesStorage {
  isActive: boolean
  currentUser: TrackChangesUser
}

export const getIsChangeTrackingActive = (editor: Editor) => editor.storage.trackChanges.isActive

export const getCurrentUser = (editor: Editor) => editor.storage.trackChanges.currentUser

export const TrackChanges = Extension.create<TrackChangesOptions, TrackChangesStorage>({
  name: 'trackChanges',

  addOptions() {
    return {
      types: [
        'paragraph',
        'blockquote',
        'bulletList',
        'hardBreak',
        'heading',
        'horizontalRule',
        'listItem',
        'orderedList',
        'codeBlock',
        'table',
        'tableRow',
        'tableHeader',
        'tableCell',
        'image',
        'figure',
        'figcaption',
      ],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          track: {
            default: [],
            rendered: true,
            renderHTML: (attributes) => (attributes.track?.length ? getTrackAttributes(attributes.track) : {}),
            parseHTML: () => [],
          },
        },
      },
      {
        types: ['insertion', 'deletion', 'formatChange'],
        attributes: {
          user: {
            default: {},
            renderHTML: ({ user }) =>
              user?.id ? { 'data-user-id': user.id, 'data-user-name': getUserName(user) } : {},
          },
          createdAt: {
            default: 0,
            renderHTML: ({ createdAt }) => (createdAt ? { 'data-created-at': formatTrackDate(createdAt) } : {}),
          },
        },
      },
    ]
  },

  addStorage() {
    return {
      isActive: false,
      currentUser: { id: 'anonymous', name: 'Anonymous' },
    }
  },

  dispatchTransaction({ transaction, next }) {
    if (!this.storage.isActive) return next(transaction)

    next(trackedTransaction(transaction, this.editor.state, this.storage.currentUser))
  },

  addCommands() {
    return {
      setTrackChangesActive: (isActive) => () => {
        this.storage.isActive = isActive
        return true
      },

      toggleTrackChangesActive:
        () =>
        ({ commands }) =>
          commands.setTrackChangesActive(!this.storage.isActive),

      setCurrentUser: (user) => () => {
        this.storage.currentUser = user
        return true
      },

      acceptChanges:
        (range) =>
        ({ state, dispatch }) =>
          acceptTrackChange(state, dispatch, range ?? state.selection),

      rejectChanges:
        (range) =>
        ({ state, dispatch }) =>
          rejectTrackChange(state, dispatch, range ?? state.selection),
    }
  },
})
