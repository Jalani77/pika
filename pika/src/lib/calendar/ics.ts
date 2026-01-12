import type { DayPlan, PlannedEvent } from '../planner'

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function formatLocal(dt: Date) {
  // Floating local time (no TZ). Google Calendar import handles this well for most users.
  const y = dt.getFullYear()
  const m = pad2(dt.getMonth() + 1)
  const d = pad2(dt.getDate())
  const hh = pad2(dt.getHours())
  const mm = pad2(dt.getMinutes())
  const ss = pad2(dt.getSeconds())
  return `${y}${m}${d}T${hh}${mm}${ss}`
}

function escapeText(s: string) {
  return s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')
}

function uid(e: PlannedEvent) {
  const base = `${e.assignmentId ?? 'pika'}_${e.kind}_${e.start.getTime()}`
  return `${base}@pika.local`
}

export function buildWeekIcs(plans: DayPlan[]) {
  const now = new Date()
  const dtstamp = formatLocal(now)

  const events = plans.flatMap((d) => d.events)
  const vevents = events
    .map((e) => {
      const summary = e.kind === 'due' ? `Due: ${e.title.replace(' • Due', '')}` : `Study: ${e.title}`
      const description =
        e.kind === 'due'
          ? 'Pika deadline marker.'
          : `Pika study session (${Math.round(e.minutes)} min).`
      return [
        'BEGIN:VEVENT',
        `UID:${escapeText(uid(e))}`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART:${formatLocal(e.start)}`,
        `DTEND:${formatLocal(e.end)}`,
        `SUMMARY:${escapeText(summary)}`,
        `DESCRIPTION:${escapeText(description)}`,
        'END:VEVENT',
      ].join('\r\n')
    })
    .join('\r\n')

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Pika//Student Dashboard//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    vevents,
    'END:VCALENDAR',
    '',
  ].join('\r\n')
}

