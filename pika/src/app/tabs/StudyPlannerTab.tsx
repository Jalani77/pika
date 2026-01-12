import { useMemo } from 'react'
import { CalendarDays, Clock, Download, Flag, Settings } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { buildWeeklyPlan } from '../../lib/planner'
import { buildWeekIcs } from '../../lib/calendar/ics'
import { Input } from '../../components/ui/Input'
import { usePika } from '../../store/usePika'

function weekdayShort(d: Date) {
  return d.toLocaleDateString(undefined, { weekday: 'short' })
}

function monthDay(d: Date) {
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function hhmm(d: Date) {
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

export function StudyPlannerTab() {
  const { assignments, planner, setPlanner } = usePika()

  const plan = useMemo(() => buildWeeklyPlan(assignments, planner), [assignments, planner])

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xl font-semibold tracking-tight text-zinc-50">Study Planner</div>
        <div className="mt-1 text-sm text-zinc-400">
          Auto-generated 7-day calendar based on your Focus Windows (no overlaps) with deadline markers.
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Focus Windows
          </CardTitle>
          <CardDescription>
            Pika schedules study sessions only inside these windows (0=Sun..6=Sat). Session length controls the slot size.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <div className="text-xs font-medium text-zinc-300">Session minutes</div>
              <Input
                type="number"
                min={15}
                max={240}
                step={15}
                value={planner.sessionMinutes}
                onChange={(e) =>
                  setPlanner({ ...planner, sessionMinutes: Number(e.target.value || 60) })
                }
              />
            </div>
            <div className="sm:col-span-2">
              <div className="text-xs text-zinc-400">
                Tip: add multiple windows per day (e.g. 07:00–08:00 + 20:00–22:00).
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {([0, 1, 2, 3, 4, 5, 6] as const).map((wd) => (
              <div key={wd} className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-zinc-50">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][wd]}
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      const next = structuredClone(planner)
                      next.focusWindows[wd] = [...(next.focusWindows[wd] ?? []), { start: '18:00', end: '20:00' }]
                      setPlanner(next)
                    }}
                  >
                    Add window
                  </Button>
                </div>

                <div className="mt-2 space-y-2">
                  {(planner.focusWindows[wd] ?? []).length === 0 ? (
                    <div className="text-xs text-zinc-500">No focus windows.</div>
                  ) : null}

                  {(planner.focusWindows[wd] ?? []).map((w, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={w.start}
                        onChange={(e) => {
                          const next = structuredClone(planner)
                          next.focusWindows[wd]![idx] = { ...w, start: e.target.value }
                          setPlanner(next)
                        }}
                      />
                      <div className="text-xs text-zinc-500">to</div>
                      <Input
                        type="time"
                        value={w.end}
                        onChange={(e) => {
                          const next = structuredClone(planner)
                          next.focusWindows[wd]![idx] = { ...w, end: e.target.value }
                          setPlanner(next)
                        }}
                      />
                      <Button
                        variant="ghost"
                        onClick={() => {
                          const next = structuredClone(planner)
                          next.focusWindows[wd] = (next.focusWindows[wd] ?? []).filter((_, i) => i !== idx)
                          setPlanner(next)
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            This week
          </CardTitle>
          <CardDescription>
            Use “Add to Google Calendar” to export the full week as an .ics file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-zinc-400">
              Study sessions are <span className="text-zinc-200">prep</span>; “Due” items are deadlines.
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                const ics = buildWeekIcs(plan)
                const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'pika-week.ics'
                document.body.appendChild(a)
                a.click()
                a.remove()
                URL.revokeObjectURL(url)
              }}
            >
              <Download className="h-4 w-4" />
              Add to Google Calendar
            </Button>
          </div>

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
                  {day.events.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-zinc-800 p-2 text-xs text-zinc-500">
                      No items
                    </div>
                  ) : (
                    day.events.map((e, idx) => (
                      <div
                        key={`${e.kind}_${e.assignmentId ?? 'x'}_${idx}`}
                        className={
                          e.kind === 'due'
                            ? 'rounded-lg border border-orange-500/25 bg-orange-500/10 p-2'
                            : 'rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2'
                        }
                      >
                        <div className="truncate text-xs font-medium text-zinc-100">{e.title}</div>
                        <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-300/90">
                          <span className="inline-flex items-center gap-1">
                            {e.kind === 'due' ? (
                              <Flag className="h-3 w-3" />
                            ) : (
                              <Clock className="h-3 w-3" />
                            )}
                            {hhmm(e.start)}–{hhmm(e.end)}
                          </span>
                          <Badge variant="default">{e.kind === 'due' ? 'Due' : 'Study'}</Badge>
                        </div>
                      </div>
                    ))
                  )}

                  {day.overflowMinutes > 0 ? (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-[11px] text-amber-200">
                      Overflow: {Math.ceil(day.overflowMinutes / 60)}h couldn’t fit inside focus windows before due date (this week).
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {assignments.length === 0 ? (
            <div className="mt-3 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/20 p-4 text-sm text-zinc-400">
              No assignments loaded. Add them via <span className="text-zinc-200">Input Engine</span> to generate a plan.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

