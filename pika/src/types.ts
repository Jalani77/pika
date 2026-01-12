export type AssignmentType = 'exam' | 'homework' | 'project'

export type Assignment = {
  id: string
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

