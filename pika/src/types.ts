export type AssignmentType = 'exam' | 'homework' | 'project'

export type Assignment = {
  id: string
  /** ISO datetime string (assignment first added/imported) */
  created_at: string
  name: string
  type: AssignmentType
  /** Weight as percentage points (e.g. 20 means 20%) */
  weight: number
  /** Score as percentage (0-100). null means not graded yet */
  score: number | null
  /** ISO date string (YYYY-MM-DD) */
  due_date: string
  /** Estimated effort in hours */
  estimated_hours: number
}

export type NotificationSettings = {
  phoneNumber: string
  alert24hDeadlines: boolean
  dailyStudyReminders: boolean
}

export type FocusWindow = {
  /** 24h time "HH:MM" */
  start: string
  /** 24h time "HH:MM" */
  end: string
}

export type PlannerSettings = {
  /** Minutes per scheduled study session block */
  sessionMinutes: number
  /** Focus windows keyed by weekday (0=Sun..6=Sat) */
  focusWindows: Record<number, FocusWindow[]>
}

