import type { Assignment } from '../types'
import { addDays, parseISODateOnly, startOfDay } from './date'

export type StudySession = {
  assignmentId: string
  title: string
  hours: number
}

export type DayPlan = {
  date: Date
  sessions: StudySession[]
  overflowHours: number
}

/**
 * Builds a 7-day plan starting today.
 * Rule of thumb: 2h blocks, one block per assignment per day, spread from today until due date.
 */
export function buildWeeklyPlan(assignments: Assignment[], now = new Date()): DayPlan[] {
  const start = startOfDay(now)
  const days: DayPlan[] = Array.from({ length: 7 }).map((_, i) => ({
    date: addDays(start, i),
    sessions: [],
    overflowHours: 0,
  }))

  for (const a of assignments) {
    let remaining = Math.max(0, Number(a.estimated_hours) || 0)
    if (remaining === 0) continue

    const due = parseISODateOnly(a.due_date)
    if (due.getTime() < start.getTime()) continue

    // Schedule within the visible week window only.
    for (const day of days) {
      if (remaining <= 0) break
      if (day.date.getTime() > due.getTime()) break

      const block = Math.min(2, remaining)
      day.sessions.push({
        assignmentId: a.id,
        title: a.name,
        hours: block,
      })
      remaining -= block
    }

    if (remaining > 0) {
      // Not enough space in the visible week or before due date.
      // Track overflow so the UI can warn the student.
      const lastIdx = Math.min(
        days.length - 1,
        Math.max(0, Math.floor((due.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))),
      )
      days[lastIdx]!.overflowHours += remaining
    }
  }

  return days
}

