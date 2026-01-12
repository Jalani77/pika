import React, { useState } from 'react'
import type { Assignment, NotificationSettings } from '../types'
import { safeJsonParse } from '../lib/utils'
import { createId } from './assignment'
import { PikaStoreContext, type PikaStore } from './pika-context'

const ASSIGNMENTS_KEY = 'pika.assignments.v1'
const NOTIFS_KEY = 'pika.notifications.v1'

function seedAssignments(): Assignment[] {
  const today = new Date()
  const inDays = (n: number) => {
    const d = new Date(today)
    d.setDate(d.getDate() + n)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  return [
    {
      id: createId(),
      name: 'Calculus Homework 4',
      type: 'homework',
      weight: 5,
      score: null,
      due_date: inDays(1),
      estimated_hours: 3,
    },
    {
      id: createId(),
      name: 'CS Project Milestone',
      type: 'project',
      weight: 20,
      score: null,
      due_date: inDays(5),
      estimated_hours: 10,
    },
    {
      id: createId(),
      name: 'Biology Exam 1',
      type: 'exam',
      weight: 25,
      score: 88,
      due_date: inDays(10),
      estimated_hours: 6,
    },
  ]
}

function readAssignments(): Assignment[] {
  const raw = safeJsonParse<Assignment[]>(localStorage.getItem(ASSIGNMENTS_KEY))
  return Array.isArray(raw) && raw.length > 0 ? raw : seedAssignments()
}

function readNotifications(): NotificationSettings {
  const raw = safeJsonParse<NotificationSettings>(localStorage.getItem(NOTIFS_KEY))
  return (
    raw ?? {
      phoneNumber: '',
      alert24hDeadlines: true,
      dailyStudyReminders: false,
    }
  )
}

export function PikaProvider({ children }: { children: React.ReactNode }) {
  const [assignments, _setAssignments] = useState<Assignment[]>(() => readAssignments())
  const [notifications, _setNotifications] = useState<NotificationSettings>(() =>
    readNotifications(),
  )

  const setAssignments = (next: Assignment[]) => {
    _setAssignments(next)
    localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(next))
  }

  const upsertAssignment = (a: Assignment) => {
    _setAssignments((prev) => {
      const idx = prev.findIndex((x) => x.id === a.id)
      const next = idx >= 0 ? prev.map((x) => (x.id === a.id ? a : x)) : [a, ...prev]
      localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(next))
      return next
    })
  }

  const updateAssignment = (id: string, patch: Partial<Assignment>) => {
    _setAssignments((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, ...patch } : a))
      localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(next))
      return next
    })
  }

  const deleteAssignment = (id: string) => {
    _setAssignments((prev) => {
      const next = prev.filter((a) => a.id !== id)
      localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(next))
      return next
    })
  }

  const setScore = (id: string, score: number | null) => {
    updateAssignment(id, { score })
  }

  const setNotifications = (next: NotificationSettings) => {
    _setNotifications(next)
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(next))
  }

  const value: PikaStore = {
    assignments,
    setAssignments,
    upsertAssignment,
    updateAssignment,
    deleteAssignment,
    setScore,
    notifications,
    setNotifications,
  }

  return <PikaStoreContext.Provider value={value}>{children}</PikaStoreContext.Provider>
}

