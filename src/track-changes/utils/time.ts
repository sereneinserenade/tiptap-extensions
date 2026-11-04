/** Track timestamps are stored in whole minutes since the Unix epoch. */
export const nowInMinutes = () => Math.floor(Date.now() / 60000)

const pad = (n: number) => `${n}`.padStart(2, '0')

/** Formats a minute timestamp as `dd/MM/yyyy HH:mm` in local time. */
export const formatTrackDate = (minutes: number) => {
  const d = new Date(minutes * 60000)
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
