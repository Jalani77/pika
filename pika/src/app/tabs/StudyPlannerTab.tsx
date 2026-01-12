import { useMemo } from 'react'
import { CalendarDays, Clock } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { buildWeeklyPlan } from '../../lib/planner'
import { usePika } from '../../store/usePika'

function weekdayShort(d: Date) {
  return d.toLocaleDateString(undefined, { weekday: 'short' })
}

function monthDay(d: Date) {
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function StudyPlannerTab() {
  const { assignments } = usePika()

  const plan = useMemo(() => buildWeeklyPlan(assignments), [assignments])

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xl font-semibold tracking-tight text-zinc-50">Study Planner</div>
        <div className="mt-1 text-sm text-zinc-400">
          Auto-generated 7-day calendar with 2-hour study blocks distributed until due dates.
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            This week
          </CardTitle>
          <CardDescription>
            Example behavior: a 10-hour project due Friday becomes 2-hour blocks Mon–Fri.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
            {plan.map((day) => (
              <div
                key={day.date.toISOString()}
                className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-3"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <div className="text-sm font-semibold text-zinc-50">{weekdayShort(day.date)}</div>
                  <div className="text-xs text-zinc-400">{monthDay(day.date)}</div>
                </div>

                <div className="mt-2 space-y-2">
                  {day.sessions.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-zinc-800 p-2 text-xs text-zinc-500">
                      No sessions
                    </div>
                  ) : (
                    day.sessions.map((s, idx) => (
                      <div
                        key={`${s.assignmentId}_${idx}`}
                        className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-2"
                      >
                        <div className="truncate text-xs font-medium text-zinc-100">{s.title}</div>
                        <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-400">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {s.hours}h
                          </span>
                          <Badge variant="default">Study</Badge>
                        </div>
                      </div>
                    ))
                  )}

                  {day.overflowHours > 0 ? (
                    <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-2 text-[11px] text-yellow-200">
                      Overflow: {day.overflowHours}h couldn’t fit before due date (in this view).
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

