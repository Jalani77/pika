import { createContext } from 'react'
import type { Assignment, NotificationSettings, PlannerSettings } from '../types'

export type PikaStore = {
  assignments: Assignment[]
  setAssignments: (next: Assignment[]) => void
  upsertAssignment: (a: Assignment) => void
  updateAssignment: (id: string, patch: Partial<Assignment>) => void
  deleteAssignment: (id: string) => void
  setScore: (id: string, score: number | null) => void

  notifications: NotificationSettings
  setNotifications: (next: NotificationSettings) => void

  planner: PlannerSettings
  setPlanner: (next: PlannerSettings) => void
}

export const PikaStoreContext = createContext<PikaStore | null>(null)

