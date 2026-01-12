import { useMemo, useState } from 'react'
import { FileText, Sparkles, Wand2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { parseSyllabusText, SYLLABUS_EXAMPLE } from '../../lib/syllabus'
import { usePika } from '../../store/usePika'

type Step = 1 | 2 | 3

export function SyllabusWizardTab() {
  const { setAssignments } = usePika()
  const [step, setStep] = useState<Step>(1)
  const [filename, setFilename] = useState<string>('')
  const [rawText, setRawText] = useState<string>('')
  const [didApply, setDidApply] = useState(false)

  const parsed = useMemo(() => parseSyllabusText(rawText), [rawText])

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xl font-semibold tracking-tight text-zinc-50">AI Syllabus Extraction</div>
        <div className="mt-1 text-sm text-zinc-400">
          Clean wizard UI that populates the rest of Pika. Backend is mocked for now.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card className={step === 1 ? 'border-indigo-500/40' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Step 1 • Upload
            </CardTitle>
            <CardDescription>PDF/Text upload (PDF parsing is mocked).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              type="file"
              accept=".txt,.pdf"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (!f) return
                setFilename(f.name)
                setDidApply(false)
                if (f.name.toLowerCase().endsWith('.txt')) {
                  const reader = new FileReader()
                  reader.onload = () => setRawText(String(reader.result ?? ''))
                  reader.readAsText(f)
                } else {
                  // PDF mocked: user can paste extracted text.
                  setRawText('')
                }
              }}
            />
            <div className="text-xs text-zinc-400">
              Selected: <span className="text-zinc-200">{filename || 'none'}</span>
            </div>
            <Button variant="secondary" onClick={() => setStep(2)}>
              Continue
            </Button>
          </CardContent>
        </Card>

        <Card className={step === 2 ? 'border-indigo-500/40' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Step 2 • Paste / Review
            </CardTitle>
            <CardDescription>
              Paste syllabus text or use the example format below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setRawText(SYLLABUS_EXAMPLE)
                  setDidApply(false)
                }}
              >
                Load example
              </Button>
              <Button variant="secondary" onClick={() => setStep(3)} disabled={rawText.trim() === ''}>
                Parse
              </Button>
            </div>
            <textarea
              className="min-h-52 w-full rounded-xl border border-zinc-800 bg-zinc-950/50 p-3 text-sm text-zinc-50 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              placeholder={`Recommended format:\nName | type | weight% | YYYY-MM-DD | hours | optional score\n`}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value)
                setDidApply(false)
              }}
            />
            {filename.toLowerCase().endsWith('.pdf') ? (
              <div className="text-xs text-zinc-400">
                Tip: PDF parsing is mocked—paste your extracted text here.
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className={step === 3 ? 'border-indigo-500/40' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Step 3 • Populate Pika
            </CardTitle>
            <CardDescription>Apply parsed assignments to the global dashboard state.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-zinc-200">
              Extracted:{' '}
              <span className="font-semibold text-zinc-50">{parsed.length}</span>{' '}
              assignments
            </div>

            <div className="max-h-52 space-y-2 overflow-auto pr-1">
              {parsed.length === 0 ? (
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-3 text-xs text-zinc-400">
                  No structured assignments detected yet. Try the pipe format shown in Step 2.
                </div>
              ) : (
                parsed.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-3"
                  >
                    <div className="text-sm font-medium text-zinc-50">{a.name}</div>
                    <div className="mt-1 text-xs text-zinc-400">
                      {a.type} • {a.weight}% • due {a.due_date} • {a.estimated_hours}h
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => setStep(2)}
              >
                Back
              </Button>
              <Button
                onClick={() => {
                  setAssignments(parsed)
                  setDidApply(true)
                }}
                disabled={parsed.length === 0}
              >
                Apply to Pika
              </Button>
            </div>

            {didApply ? (
              <div className="text-xs text-emerald-300">
                Applied! Switch tabs to see dashboards update.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

