import { useMemo, useState } from 'react'
import { Calculator, Target } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { clamp } from '../../lib/utils'
import { usePika } from '../../store/usePika'
import type { AssignmentType } from '../../types'

function round1(n: number) {
  return Math.round(n * 10) / 10
}

function fmt(n: number | null) {
  if (n == null || Number.isNaN(n)) return '—'
  return `${round1(n)}%`
}

export function GradeArchitectTab() {
  const { assignments, setScore } = usePika()
  const [goal, setGoal] = useState<number>(90)

  const metrics = useMemo(() => {
    const totalWeight = assignments.reduce((acc, a) => acc + (Number(a.weight) || 0), 0)
    const done = assignments.filter((a) => a.score != null)
    const doneWeight = done.reduce((acc, a) => acc + (Number(a.weight) || 0), 0)
    const points = done.reduce((acc, a) => acc + (Number(a.weight) || 0) * (a.score ?? 0), 0)
    const current = doneWeight > 0 ? points / doneWeight : null

    const remainingWeight = Math.max(0, totalWeight - doneWeight)
    const needed =
      remainingWeight > 0 ? (goal * totalWeight - points) / remainingWeight : null

    return {
      totalWeight,
      doneWeight,
      remainingWeight,
      points,
      current,
      needed,
    }
  }, [assignments, goal])

  const byType = useMemo(() => {
    const types: AssignmentType[] = ['exam', 'homework', 'project']
    return types.map((t) => {
      const group = assignments.filter((a) => a.type === t)
      const done = group.filter((a) => a.score != null)
      const doneWeight = done.reduce((acc, a) => acc + (Number(a.weight) || 0), 0)
      const points = done.reduce((acc, a) => acc + (Number(a.weight) || 0) * (a.score ?? 0), 0)
      const avg = doneWeight > 0 ? points / doneWeight : null
      return { type: t, count: group.length, doneWeight, avg }
    })
  }, [assignments])

  const neededLabel =
    metrics.needed == null
      ? metrics.remainingWeight === 0
        ? 'All assignments are scored.'
        : '—'
      : metrics.needed > 100
        ? 'Not possible (needs > 100%).'
        : metrics.needed < 0
          ? 'Goal already guaranteed.'
          : `${round1(metrics.needed)}%`

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xl font-semibold tracking-tight text-zinc-50">Grade Architect</div>
        <div className="mt-1 text-sm text-zinc-400">
          Predictive calculator based on global assignment weights and scores.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Current grade
            </CardTitle>
            <CardDescription>Weighted average across graded assignments.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight">
              {metrics.current == null ? '—' : `${round1(metrics.current)}%`}
            </div>
            <div className="mt-2 text-xs text-zinc-400">
              Completed weight: <span className="text-zinc-200">{round1(metrics.doneWeight)}%</span>{' '}
              / Total weight: <span className="text-zinc-200">{round1(metrics.totalWeight)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Goal grade
            </CardTitle>
            <CardDescription>
              Exact average needed on remaining (unscored) assignments to hit your goal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-1">
                <div className="text-xs font-medium text-zinc-300">Goal</div>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={goal}
                  onChange={(e) => setGoal(clamp(Number(e.target.value || 0), 0, 100))}
                />
              </div>
              <div className="sm:col-span-2">
                <div className="text-xs font-medium text-zinc-300">Needed avg on remaining</div>
                <div className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">
                  {neededLabel}
                </div>
                <div className="mt-1 text-xs text-zinc-400">
                  Remaining weight:{' '}
                  <span className="text-zinc-200">{round1(metrics.remainingWeight)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weighted average table</CardTitle>
          <CardDescription>
            Grouped view (a stand-in for “classes” until courses are added).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr className="text-left text-xs text-zinc-400">
                  <th className="border-b border-zinc-800 pb-2">Group</th>
                  <th className="border-b border-zinc-800 pb-2"># Items</th>
                  <th className="border-b border-zinc-800 pb-2">Completed weight</th>
                  <th className="border-b border-zinc-800 pb-2">Current avg</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-zinc-200">
                  <td className="border-b border-zinc-800 py-2 font-medium">All</td>
                  <td className="border-b border-zinc-800 py-2">{assignments.length}</td>
                  <td className="border-b border-zinc-800 py-2">{round1(metrics.doneWeight)}%</td>
                  <td className="border-b border-zinc-800 py-2">{fmt(metrics.current)}</td>
                </tr>
                {byType.map((row) => (
                  <tr key={row.type} className="text-zinc-200">
                    <td className="border-b border-zinc-800 py-2 font-medium capitalize">
                      {row.type}
                    </td>
                    <td className="border-b border-zinc-800 py-2">{row.count}</td>
                    <td className="border-b border-zinc-800 py-2">{round1(row.doneWeight)}%</td>
                    <td className="border-b border-zinc-800 py-2">{fmt(row.avg)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
          <CardDescription>Update scores here; everything recalculates instantly.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {assignments.map((a) => (
            <div
              key={a.id}
              className="flex flex-col gap-2 rounded-xl border border-zinc-800 bg-zinc-950/30 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-zinc-50">{a.name}</div>
                <div className="mt-0.5 text-xs text-zinc-400">
                  {a.type} • {a.weight}% • due {a.due_date}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className="capitalize">{a.score == null ? 'pending' : 'scored'}</Badge>
                <Input
                  className="w-28"
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={a.score ?? ''}
                  placeholder="Score"
                  onChange={(e) => {
                    const raw = e.target.value
                    if (raw === '') return setScore(a.id, null)
                    setScore(a.id, clamp(Number(raw), 0, 100))
                  }}
                />
                <Button variant="ghost" onClick={() => setScore(a.id, null)}>
                  Clear
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

