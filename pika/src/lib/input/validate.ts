import { z } from 'zod'
import type { Assignment, AssignmentType } from '../../types'
import { createAssignment } from '../../store/assignment'
import { clamp } from '../utils'

const TypeSchema = z.enum(['exam', 'homework', 'project'])

export const LlmAssignmentSchema = z.object({
  name: z.string().min(1),
  type: TypeSchema,
  weight: z.number(),
  score: z.number().min(0).max(100).nullable().optional(),
  due_date: z.string().min(1),
  estimated_hours: z.number(),
})

export const LlmAssignmentsSchema = z.array(LlmAssignmentSchema).min(1)

function isIsoDateOnly(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s)
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function parseMonthName(s: string) {
  const m = s.trim().slice(0, 3).toLowerCase()
  const map: Record<string, number> = {
    jan: 1,
    feb: 2,
    mar: 3,
    apr: 4,
    may: 5,
    jun: 6,
    jul: 7,
    aug: 8,
    sep: 9,
    oct: 10,
    nov: 11,
    dec: 12,
  }
  return map[m] ?? null
}

function coerceDueDate(raw: string, now = new Date()): string {
  const trimmed = raw.trim()
  if (isIsoDateOnly(trimmed)) return trimmed

  // Try "MM/DD" or "MM/DD/YY(YY)"
  const mdy = trimmed.match(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/)
  if (mdy) {
    const month = Number(mdy[1])
    const day = Number(mdy[2])
    let year: number | null = mdy[3] ? Number(mdy[3]) : null
    if (year != null && year < 100) year += 2000
    if (year == null) year = inferYear(month, day, now)
    return `${year}-${pad2(month)}-${pad2(day)}`
  }

  // Try "Jan 12" or "Jan 12, 2026"
  const mon = trimmed.match(/\b([A-Za-z]{3,9})\s+(\d{1,2})(?:\s*,?\s*(\d{4}))?\b/)
  if (mon) {
    const month = parseMonthName(mon[1] ?? '')
    const day = Number(mon[2])
    const year = mon[3] ? Number(mon[3]) : inferYear(month ?? 1, day, now)
    if (!month) return inferFallbackIso(now)
    return `${year}-${pad2(month)}-${pad2(day)}`
  }

  return inferFallbackIso(now)
}

function inferYear(month: number, day: number, now: Date) {
  // Edge case: syllabus dates often omit year. Infer "closest reasonable" upcoming date:
  // - default current year
  // - if it already passed (by more than ~30 days), assume next year
  const y = now.getFullYear()
  const candidate = new Date(y, month - 1, day, 23, 59, 59, 999)
  const delta = candidate.getTime() - now.getTime()
  const thirtyDays = 30 * 24 * 60 * 60 * 1000
  if (delta < -thirtyDays) return y + 1
  return y
}

function inferFallbackIso(now: Date) {
  const y = now.getFullYear()
  const m = pad2(now.getMonth() + 1)
  const d = pad2(now.getDate())
  return `${y}-${m}-${d}`
}

export function normalizeAssignmentsFromLlm(raw: unknown): Assignment[] {
  const parsed = LlmAssignmentsSchema.parse(raw)
  const now = new Date()

  return parsed.map((a) =>
    createAssignment({
      name: a.name.trim(),
      type: a.type as AssignmentType,
      weight: clamp(Number(a.weight) || 0, 0, 100),
      score: a.score == null ? null : clamp(Number(a.score), 0, 100),
      due_date: coerceDueDate(a.due_date, now),
      estimated_hours: Math.max(0, Number(a.estimated_hours) || defaultHours(a.type)),
    }),
  )
}

function defaultHours(type: AssignmentType) {
  if (type === 'exam') return 6
  if (type === 'project') return 10
  return 2
}

