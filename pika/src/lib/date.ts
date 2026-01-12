export function parseISODateOnly(isoDate: string) {
  // Interpret YYYY-MM-DD as local midnight
  const [y, m, d] = isoDate.split('-').map((x) => Number(x))
  return new Date(y, (m ?? 1) - 1, d ?? 1, 23, 59, 59, 999)
}

export function formatDHM(ms: number) {
  const clamped = Math.max(0, ms)
  const totalMinutes = Math.floor(clamped / (60 * 1000))
  const minutes = totalMinutes % 60
  const totalHours = Math.floor(totalMinutes / 60)
  const hours = totalHours % 24
  const days = Math.floor(totalHours / 24)

  return `${days}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
}

export function addDays(d: Date, days: number) {
  const out = new Date(d)
  out.setDate(out.getDate() + days)
  return out
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

