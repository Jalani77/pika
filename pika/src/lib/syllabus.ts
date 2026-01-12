import type { Assignment, AssignmentType } from '../types'
import { createAssignment } from '../store/assignment'
import { clamp } from './utils'

function parseType(raw: string): AssignmentType | null {
  const r = raw.trim().toLowerCase()
  if (r.startsWith('exam') || r.includes('midterm') || r.includes('final')) return 'exam'
  if (r.startsWith('hw') || r.includes('homework') || r.includes('problem set')) return 'homework'
  if (r.includes('project') || r.includes('milestone') || r.includes('capstone')) return 'project'
  if (r === 'homework') return 'homework'
  if (r === 'exam') return 'exam'
  if (r === 'project') return 'project'
  return null
}

function normalizeDate(raw: string): string | null {
  // Prefer YYYY-MM-DD
  const iso = raw.trim().match(/\b(20\d{2})-(\d{2})-(\d{2})\b/)
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`
  return null
}

function pickNumber(raw: string): number | null {
  const m = raw.match(/-?\d+(\.\d+)?/)
  return m ? Number(m[0]) : null
}

export function parseSyllabusText(text: string): Assignment[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  const out: Assignment[] = []

  for (const line of lines) {
    // Format A (recommended):
    // Name | type | weight% | due YYYY-MM-DD | hours
    if (line.includes('|')) {
      const parts = line.split('|').map((p) => p.trim())
      const name = parts[0]
      const type = parts[1] ? parseType(parts[1]) : null
      const weight = parts[2] ? pickNumber(parts[2]) : null
      const due = parts[3] ? normalizeDate(parts[3]) : null
      const hours = parts[4] ? pickNumber(parts[4]) : null
      const score = parts[5] ? pickNumber(parts[5]) : null

      if (name && type && weight != null && due && hours != null) {
        out.push(
          createAssignment({
            name,
            type,
            weight: Math.max(0, weight),
            due_date: due,
            estimated_hours: Math.max(0, hours),
            score: score == null ? null : clamp(score, 0, 100),
          }),
        )
        continue
      }
    }

    // Format B (looser):
    // "Biology Exam 1 (25%) - due 2026-02-05 - 6h"
    const weight = pickNumber(line.match(/\(([^)]*%)\)/)?.[1] ?? '') ?? pickNumber(line.match(/\b(\d+(\.\d+)?)\s*%\b/)?.[0] ?? '')
    const due = normalizeDate(line)
    const hours = pickNumber(line.match(/\b(\d+(\.\d+)?)\s*h(ours?)?\b/i)?.[0] ?? '')
    const type = parseType(line)

    if (weight != null && due && hours != null) {
      out.push(
        createAssignment({
          name: line.replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+-\s+/g, ' - ').trim(),
          type: type ?? 'homework',
          weight: Math.max(0, weight),
          due_date: due,
          estimated_hours: Math.max(0, hours),
        }),
      )
    }
  }

  // If nothing matched, return empty (caller can show helpful UI).
  return out
}

export const SYLLABUS_EXAMPLE = `Calculus Homework 4 | homework | 5% | 2026-01-13 | 3
CS Project Milestone | project | 20% | 2026-01-17 | 10
Biology Exam 1 | exam | 25% | 2026-01-22 | 6 | 88`

