import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Clock, Flame, Leaf } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xl font-semibold tracking-tight text-zinc-50">Dashboard</div>
          <div className="mt-1 text-sm text-zinc-400">
            Countdown cards sorted by closest deadline. Live updates every 30s.
          </div>
        </div>
        <Badge className="hidden sm:inline-flex">
          <Clock className="h-3.5 w-3.5" />
          D:H:M
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {sorted.map((a) => {
          const due = parseISODateOnly(a.due_date).getTime()
          const ms = due - now
          const variant = ms <= 0 ? 'red' : urgency(ms)

          const icon =
            variant === 'red' ? (
              <Flame className="h-4 w-4" />
            ) : variant === 'yellow' ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <Leaf className="h-4 w-4" />
            )

          const frame =
            variant === 'red'
              ? 'border-red-500/35 bg-red-500/10'
              : variant === 'yellow'
                ? 'border-yellow-500/35 bg-yellow-500/10'
                : 'border-emerald-500/30 bg-emerald-500/10'

          return (
            <Card key={a.id} className={cn('border', frame)}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="truncate">{a.name}</CardTitle>
                    <CardDescription>
                      {a.type} • {a.weight}% weight • {a.estimated_hours}h est.
                    </CardDescription>
                  </div>
                  <Badge variant={variant}>
                    {icon}
                    {ms <= 0 ? 'Overdue' : formatDHM(ms)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xs text-zinc-400">
                  Due <span className="text-zinc-200">{a.due_date}</span>
                  {a.score != null ? (
                    <>
                      {' '}
                      • Score <span className="text-zinc-200">{a.score}%</span>
                    </>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

