import type { Assignment, FocusWindow, PlannerSettings } from '../types'
import { addDays, parseISODateOnly, startOfDay } from './date'
import { clamp } from './utils'

export type PlannedEvent = {
  kind: 'study' | 'due'
  title: string
  assignmentId?: string
  start: Date
  end: Date
  minutes: number
}

export type DayPlan = {
  date: Date
  events: PlannedEvent[]
  overflowMinutes: number
}

type Slot = { start: Date; end: Date }

function parseTimeToMinutes(hhmm: string): number | null {
  const m = hhmm.trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  if (h < 0 || h > 23 || min < 0 || min > 59) return null
  return h * 60 + min
}

function normalizeWindows(windows: FocusWindow[]): Array<{ startMin: number; endMin: number }> {
  const parsed = windows
    .map((w) => {
      const s = parseTimeToMinutes(w.start)
      const e = parseTimeToMinutes(w.end)
      if (s == null || e == null) return null
      if (e <= s) return null
      return { startMin: s, endMin: e }
    })
    .filter(Boolean) as Array<{ startMin: number; endMin: number }>

  parsed.sort((a, b) => a.startMin - b.startMin)
  const merged: Array<{ startMin: number; endMin: number }> = []
  for (const w of parsed) {
    const last = merged[merged.length - 1]
    if (!last) merged.push({ ...w })
    else if (w.startMin <= last.endMin) last.endMin = Math.max(last.endMin, w.endMin)
    else merged.push({ ...w })
  }
  return merged
}

function buildSlotsForDay(date: Date, settings: PlannerSettings): Slot[] {
  const wd = date.getDay()
  const sessionMinutes = clamp(Math.floor(settings.sessionMinutes || 60), 15, 240)
  const windows = normalizeWindows(settings.focusWindows[wd] ?? [])
  const slots: Slot[] = []

  for (const w of windows) {
    let t = w.startMin
    while (t + sessionMinutes <= w.endMin) {
      const start = new Date(date)
      start.setHours(0, 0, 0, 0)
      start.setMinutes(t)
      const end = new Date(start.getTime() + sessionMinutes * 60 * 1000)
      slots.push({ start, end })
      t += sessionMinutes
    }
  }

  return slots
}

function endOfDayDue(dueDateOnly: string) {
  return parseISODateOnly(dueDateOnly)
}

/**
 * Builds a 7-day plan starting today using user "Focus Windows".
 * - No overlaps: sessions are placed into discrete time slots.
 * - Adds explicit due-date markers on the due day (if within the week).
 */
export function buildWeeklyPlan(
  assignments: Assignment[],
  settings: PlannerSettings,
  now = new Date(),
): DayPlan[] {
  const start = startOfDay(now)
  const days: DayPlan[] = Array.from({ length: 7 }).map((_, i) => ({
    date: addDays(start, i),
    events: [],
    overflowMinutes: 0,
  }))

  const slotsByDay = days.map((d) => buildSlotsForDay(d.date, settings))

  const sorted = [...assignments].sort((a, b) => {
    const da = parseISODateOnly(a.due_date).getTime()
    const db = parseISODateOnly(b.due_date).getTime()
    return da - db
  })

  for (const a of sorted) {
    let remaining = Math.max(0, Math.round((Number(a.estimated_hours) || 0) * 60))
    if (remaining === 0) continue

    const due = endOfDayDue(a.due_date).getTime()
    if (due < start.getTime()) continue

    // Place study sessions into available slots up to the due date (and within the visible week).
    for (let i = 0; i < days.length; i++) {
      if (remaining <= 0) break
      const day = days[i]!
      const dayEnd = new Date(day.date)
      dayEnd.setHours(23, 59, 59, 999)
      if (day.date.getTime() > due) break

      const slots = slotsByDay[i]!
      while (slots.length > 0 && remaining > 0) {
        const slot = slots[0]!
        // Avoid scheduling after due moment.
        if (slot.start.getTime() > due) break
        const slotMinutes = Math.round((slot.end.getTime() - slot.start.getTime()) / (60 * 1000))
        const use = Math.min(slotMinutes, remaining)

        const end = new Date(slot.start.getTime() + use * 60 * 1000)
        day.events.push({
          kind: 'study',
          assignmentId: a.id,
          title: a.name,
          start: slot.start,
          end,
          minutes: use,
        })

        remaining -= use
        slots.shift()

        // If we partially used a slot (rare because we discretize), put back remainder.
        if (use < slotMinutes) {
          slots.unshift({ start: end, end: slot.end })
          break
        }

        // Stop if we crossed due time for that day.
        if (end.getTime() > due || dayEnd.getTime() > due) break
      }
    }

    if (remaining > 0) {
      const lastIdx = Math.min(
        days.length - 1,
        Math.max(0, Math.floor((due - start.getTime()) / (24 * 60 * 60 * 1000))),
      )
      days[lastIdx]!.overflowMinutes += remaining
    }

    // Add a due-date marker if within this 7-day window.
    const dueIdx = Math.floor((due - start.getTime()) / (24 * 60 * 60 * 1000))
    if (dueIdx >= 0 && dueIdx < days.length) {
      const day = days[dueIdx]!
      const markerEnd = new Date(day.date)
      markerEnd.setHours(23, 59, 0, 0)
      const markerStart = new Date(markerEnd.getTime() - 15 * 60 * 1000)
      day.events.push({
        kind: 'due',
        assignmentId: a.id,
        title: `${a.name} • Due`,
        start: markerStart,
        end: markerEnd,
        minutes: 15,
      })
    }
  }

  // Sort events within each day (study + due).
  for (const d of days) {
    d.events.sort((a, b) => a.start.getTime() - b.start.getTime())
  }

  return days
}

