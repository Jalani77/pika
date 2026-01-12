import type { Assignment, AssignmentType } from '../types'

export function createId() {
  if ('crypto' in globalThis && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }
  return `id_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

export function createAssignment(input: {
  name: string
  type: AssignmentType
  weight: number
  due_date: string
  estimated_hours: number
  score?: number | null
}): Assignment {
  return {
    id: createId(),
    created_at: new Date().toISOString(),
    name: input.name,
    type: input.type,
    weight: input.weight,
    score: input.score ?? null,
    due_date: input.due_date,
    estimated_hours: input.estimated_hours,
  }
}

