import { useEffect, useMemo, useState } from 'react'
import type { ComponentType } from 'react'
import {
  Bell,
  CalendarDays,
  Calculator,
  LayoutDashboard,
  Wand2,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { DashboardTab } from './tabs/DashboardTab'
import { GradeArchitectTab } from './tabs/GradeArchitectTab'
import { SyllabusWizardTab } from './tabs/SyllabusWizardTab'
import { StudyPlannerTab } from './tabs/StudyPlannerTab'
import { NotificationsTab } from './tabs/NotificationsTab'

export type TabKey = 'dashboard' | 'grade' | 'syllabus' | 'planner' | 'notifications'

const TABS: Array<{
  key: TabKey
  label: string
  icon: ComponentType<{ className?: string }>
}> = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'grade', label: 'Grade Architect', icon: Calculator },
  { key: 'syllabus', label: 'Input Engine', icon: Wand2 },
  { key: 'planner', label: 'Study Planner', icon: CalendarDays },
  { key: 'notifications', label: 'Notifications', icon: Bell },
]

function readTabFromHash(): TabKey | null {
  const raw = window.location.hash.replace('#', '').trim()
  const hit = TABS.find((t) => t.key === raw)?.key
  return hit ?? null
}

export function AppShell() {
  const [tab, setTab] = useState<TabKey>(() => readTabFromHash() ?? 'dashboard')

  useEffect(() => {
    const onHash = () => {
      const next = readTabFromHash()
      if (next) setTab(next)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    window.location.hash = `#${tab}`
  }, [tab])

  const content = useMemo(() => {
    switch (tab) {
      case 'dashboard':
        return <DashboardTab />
      case 'grade':
        return <GradeArchitectTab />
      case 'syllabus':
        return <SyllabusWizardTab />
      case 'planner':
        return <StudyPlannerTab />
      case 'notifications':
        return <NotificationsTab />
    }
  }, [tab])

  return (
    <div className="min-h-full bg-zinc-950 text-zinc-50">
      <div className="mx-auto flex min-h-full max-w-7xl">
        <aside className="sticky top-0 hidden h-screen w-72 flex-none border-r border-zinc-800/70 bg-zinc-950/60 p-4 backdrop-blur md:block">
          <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-500/20 text-indigo-200">
              <span className="text-sm font-bold">P</span>
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold tracking-tight">Pika</div>
              <div className="truncate text-xs text-zinc-400">student dashboard</div>
            </div>
          </div>

          <nav className="mt-4 space-y-1">
            {TABS.map((t) => {
              const Icon = t.icon
              const active = t.key === tab
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500/50',
                    active
                      ? 'bg-indigo-500/15 text-indigo-100 border border-indigo-500/25'
                      : 'text-zinc-200 hover:bg-zinc-900/60',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="truncate">{t.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 text-xs text-zinc-400">
            Tip: Start in <span className="text-zinc-200">Input Engine</span> to populate assignments.
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between gap-3 md:hidden">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-500/20 text-indigo-200">
                <span className="text-sm font-bold">P</span>
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold tracking-tight">Pika</div>
                <div className="text-xs text-zinc-400">student dashboard</div>
              </div>
            </div>

            <select
              value={tab}
              onChange={(e) => setTab(e.target.value as TabKey)}
              className="h-10 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 text-sm text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              {TABS.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mx-auto max-w-4xl">{content}</div>
        </main>
      </div>
    </div>
  )
}

