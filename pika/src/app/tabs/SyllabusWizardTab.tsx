import { useMemo, useState } from 'react'
import { FileText, Sparkles, Wand2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { FileDropzone } from '../../components/FileDropzone'
import { extractTextFromFile } from '../../lib/input/extract'
import { runAssignmentsLlm, type LlmProvider } from '../../lib/input/llm'
import { normalizeAssignmentsFromLlm } from '../../lib/input/validate'
import { usePika } from '../../store/usePika'
import type { Assignment } from '../../types'

type Step = 1 | 2 | 3

export function SyllabusWizardTab() {
  const { setAssignments } = usePika()
  const [step, setStep] = useState<Step>(1)
  const [provider, setProvider] = useState<LlmProvider>('openai')
  const [fileName, setFileName] = useState<string>('')
  const [extractedText, setExtractedText] = useState<string>('')
  const [llmJson, setLlmJson] = useState<unknown | null>(null)
  const [preview, setPreview] = useState<Assignment[]>([])
  const [isExtracting, setIsExtracting] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [didApply, setDidApply] = useState(false)

  const parsed = useMemo(() => preview, [preview])

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xl font-semibold tracking-tight text-zinc-50">AI Syllabus Extraction</div>
        <div className="mt-1 text-sm text-zinc-400">
          Upload a syllabus, extract text, then use an LLM to produce a strictly validated JSON array of assignments.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card className={step === 1 ? 'border-indigo-500/40' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Step 1 • Upload
            </CardTitle>
            <CardDescription>Drag & drop a PDF or DOCX syllabus.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <FileDropzone
              disabled={isExtracting || isParsing}
              onFile={async (file) => {
                setError(null)
                setDidApply(false)
                setFileName(file.name)
                setLlmJson(null)
                setPreview([])
                setIsExtracting(true)
                try {
                  const res = await extractTextFromFile(file)
                  setExtractedText(res.text)
                  setStep(2)
                } catch (e) {
                  setError(e instanceof Error ? e.message : 'Failed to extract text.')
                } finally {
                  setIsExtracting(false)
                }
              }}
            />

            {fileName ? (
              <div className="text-xs text-zinc-400">
                Selected: <span className="text-zinc-200">{fileName}</span>
              </div>
            ) : null}

            {isExtracting ? <div className="text-xs text-zinc-400">Extracting text…</div> : null}
            {error ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
                {error}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className={step === 2 ? 'border-indigo-500/40' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Step 2 • Extracted text
            </CardTitle>
            <CardDescription>
              Review the extracted text (read-only) and choose an LLM provider.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-xs font-medium text-zinc-300">Provider</div>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as LlmProvider)}
                className="h-10 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 text-sm text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                disabled={isParsing}
              >
                <option value="openai">OpenAI</option>
                <option value="gemini">Gemini</option>
              </select>

              <Button
                variant="secondary"
                disabled={!extractedText || isParsing}
                onClick={async () => {
                  setError(null)
                  setDidApply(false)
                  setIsParsing(true)
                  try {
                    const res = await runAssignmentsLlm({ provider, extractedText })
                    const assignments = normalizeAssignmentsFromLlm(res.parsedJson)
                    setLlmJson(res.parsedJson)
                    setPreview(assignments)
                    // move to preview/apply
                    setStep(3)
                  } catch (e) {
                    setError(e instanceof Error ? e.message : 'AI parsing failed.')
                  } finally {
                    setIsParsing(false)
                  }
                }}
              >
                Parse with AI
              </Button>
            </div>

            <textarea
              readOnly
              className="min-h-52 w-full rounded-xl border border-zinc-800 bg-zinc-950/50 p-3 text-sm text-zinc-50 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              value={extractedText}
              placeholder="Extracted text will appear here after upload…"
            />

            {llmJson ? (
              <details className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-3">
                <summary className="cursor-pointer text-xs font-medium text-zinc-300">
                  View raw LLM JSON (debug)
                </summary>
                <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words text-[11px] text-zinc-200">
                  {JSON.stringify(llmJson, null, 2)}
                </pre>
              </details>
            ) : null}

            {isParsing ? <div className="text-xs text-zinc-400">Calling LLM…</div> : null}
            {error ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
                {error}
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
                  No valid assignment JSON detected. Go back and re-run “Parse with AI”.
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

