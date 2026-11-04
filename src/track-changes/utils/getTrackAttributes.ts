import { formatTrackDate } from './time'

export interface TrackChangesUser {
  id: string | number
  name?: string
  first_name?: string
  last_name?: string
  [key: string]: unknown
}

export const getUserName = (user: TrackChangesUser) => user.name ?? [user.first_name, user.last_name].filter(Boolean).join(' ')

export const getTrackAttributes = (trackArray: any[] = []) => {
  const track = trackArray.find((t) => t.type === 'deletion') ?? trackArray.find((t) => t.type === 'insertion')

  if (!track) return {}

  const className = track.type === 'deletion' ? 'del' : 'ins'

  return {
    class: className,
    'data-user-name': getUserName(track.user ?? {}),
    'data-created-at': formatTrackDate(track.createdAt),
  }
}
