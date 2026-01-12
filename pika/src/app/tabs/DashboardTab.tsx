import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Clock, Flame, Inbox, Leaf } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { ProgressRing } from '../../components/ui/ProgressRing'
import { parseISODateOnly, formatDHM } from '../../lib/date'
import { cn } from '../../lib/utils'
import { usePika } from '../../store/usePika'

function urgency(msRemaining: number) {
  const day = 24 * 60 * 60 * 1000
  if (msRemaining < day) return 'red' as const
  if (msRemaining < 3 * day) return 'yellow' as const
  return 'green' as const
}

export function DashboardTab() {
  const { assignments } = usePika()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  const sorted = useMemo(() => {
    return [...assignments].sort((a, b) => {
      const da = parseISODateOnly(a.due_date).getTime()
      const db = parseISODateOnly(b.due_date).getTime()
      return da - db
    })
  }, [assignments])

  return (
    <div className="space-y-4">
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.14),transparent_45%),radial-gradient(circle_at_80%_20%,rgba(245,158,11,0.12),transparent_40%),radial-gradient(circle_at_60%_90%,rgba(249,115,22,0.12),transparent_45%)]" />
        <div className="relative p-4 md:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xl font-semibold tracking-tight text-zinc-50">Dashboard</div>
              <div className="mt-1 text-sm text-zinc-400">
                Urgency Visualizer • sorted by closest deadline • live countdowns (D:HH:MM)
              </div>
            </div>
            <Badge className="hidden sm:inline-flex">
              <Clock className="h-3.5 w-3.5" />
              D:H:M
            </Badge>
          </div>
        </div>
      </Card>

      {sorted.length === 0 ? (
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              No assignments yet
            </CardTitle>
            <CardDescription>
              Upload a syllabus in <span className="text-zinc-200">Input Engine</span> to populate your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-xs font-medium text-zinc-200">Urgency cards</div>
                <div className="mt-1 text-xs text-zinc-400">Live countdown + progress ring</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-xs font-medium text-zinc-200">Grade Architect</div>
                <div className="mt-1 text-xs text-zinc-400">Goal grade + required average</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-xs font-medium text-zinc-200">Study Planner</div>
                <div className="mt-1 text-xs text-zinc-400">Focus windows + export week</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {sorted.map((a) => {
            const due = parseISODateOnly(a.due_date).getTime()
            const created = Number.isFinite(new Date(a.created_at).getTime())
              ? new Date(a.created_at).getTime()
              : now
            const ms = due - now
            const variant = ms <= 0 ? 'red' : urgency(ms)

            // progress: % elapsed from created_at -> due_date
            const denom = Math.max(1, due - created)
            const progress = (now - created) / denom

            const visual =
              variant === 'red'
                ? {
                    tone: 'text-orange-300',
                    frame:
                      'border-orange-500/35 bg-gradient-to-br from-orange-500/15 to-transparent',
                    badge: 'bg-orange-500/15 text-orange-200 border-orange-500/30',
                    icon: <Flame className="h-4 w-4" />,
                    pulse: 'animate-pulse',
                    label: 'Immediate',
                  }
                : variant === 'yellow'
                  ? {
                      tone: 'text-amber-200',
                      frame:
                        'border-amber-500/25 bg-gradient-to-br from-amber-500/12 to-transparent',
                      badge: 'bg-amber-500/15 text-amber-200 border-amber-500/30',
                      icon: <AlertTriangle className="h-4 w-4" />,
                      pulse: '',
                      label: 'Upcoming',
                    }
                  : {
                      tone: 'text-emerald-200',
                      frame:
                        'border-emerald-500/25 bg-gradient-to-br from-emerald-500/12 to-transparent',
                      badge: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30',
                      icon: <Leaf className="h-4 w-4" />,
                      pulse: '',
                      label: 'Safe',
                    }

            return (
              <Card key={a.id} className={cn('border', visual.frame)}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="truncate">{a.name}</CardTitle>
                      <CardDescription>
                        {a.type} • {a.weight}% weight • {a.estimated_hours}h est.
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={cn('relative', visual.tone, visual.pulse)}>
                        <ProgressRing value={progress} />
                        <div className="absolute inset-0 grid place-items-center text-[10px] font-semibold text-zinc-50/90">
                          {Math.round(Math.min(1, Math.max(0, progress)) * 100)}%
                        </div>
                      </div>
                      <span
                        className={cn(
                          'inline-flex items-center gap-2 rounded-md border px-2 py-0.5 text-xs font-medium',
                          visual.badge,
                        )}
                      >
                        {visual.icon}
                        {ms <= 0 ? 'Overdue' : formatDHM(ms)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                    <span>
                      Due <span className="text-zinc-200">{a.due_date}</span>
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-300">{visual.label}</span>
                    {a.score != null ? (
                      <>
                        <span className="text-zinc-600">•</span>
                        <span>
                          Score <span className="text-zinc-200">{a.score}%</span>
                        </span>
                      </>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

