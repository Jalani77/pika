import { buildAssignmentsPrompt } from './prompt'

export type LlmProvider = 'openai' | 'gemini'

export type LlmResult = {
  provider: LlmProvider
  rawText: string
  parsedJson: unknown
}

function extractJsonCandidate(text: string) {
  // Prefer exact JSON array; fall back to first bracketed array segment.
  const trimmed = text.trim()
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) return trimmed

  const start = trimmed.indexOf('[')
  const end = trimmed.lastIndexOf(']')
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1)
  return trimmed
}

function safeParseJson(raw: string): unknown {
  const candidate = extractJsonCandidate(raw)
  return JSON.parse(candidate)
}

export async function runAssignmentsLlm(opts: {
  provider: LlmProvider
  extractedText: string
}): Promise<LlmResult> {
  const prompt = buildAssignmentsPrompt(opts.extractedText)
  if (opts.provider === 'openai') return runOpenAi(prompt)
  return runGemini(prompt)
}

async function runOpenAi(prompt: string): Promise<LlmResult> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined
  const endpoint =
    (import.meta.env.VITE_PIKA_LLM_ENDPOINT as string | undefined) ?? null
  const model = (import.meta.env.VITE_OPENAI_MODEL as string | undefined) ?? 'gpt-4o-mini'

  if (endpoint) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ provider: 'openai', prompt }),
    })
    if (!res.ok) throw new Error(`LLM endpoint failed (${res.status})`)
    const json = (await res.json()) as unknown
    return { provider: 'openai', rawText: JSON.stringify(json), parsedJson: json }
  }

  if (!apiKey) {
    throw new Error(
      'Missing VITE_OPENAI_API_KEY. Set it (or provide VITE_PIKA_LLM_ENDPOINT) to enable AI parsing.',
    )
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      messages: [
        { role: 'system', content: 'You return ONLY valid JSON.' },
        { role: 'user', content: prompt },
      ],
    }),
  })

  if (!res.ok) {
    const t = await res.text()
    throw new Error(`OpenAI request failed (${res.status}): ${t}`)
  }

  const data = (await res.json()) as unknown
  const rawText = String(
    (data as { choices?: Array<{ message?: { content?: unknown } }> })?.choices?.[0]?.message
      ?.content ?? '',
  )
  const parsedJson = safeParseJson(rawText)
  return { provider: 'openai', rawText, parsedJson }
}

async function runGemini(prompt: string): Promise<LlmResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined
  const endpoint =
    (import.meta.env.VITE_PIKA_LLM_ENDPOINT as string | undefined) ?? null
  const model =
    (import.meta.env.VITE_GEMINI_MODEL as string | undefined) ?? 'gemini-1.5-flash'

  if (endpoint) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ provider: 'gemini', prompt }),
    })
    if (!res.ok) throw new Error(`LLM endpoint failed (${res.status})`)
    const json = (await res.json()) as unknown
    return { provider: 'gemini', rawText: JSON.stringify(json), parsedJson: json }
  }

  if (!apiKey) {
    throw new Error(
      'Missing VITE_GEMINI_API_KEY. Set it (or provide VITE_PIKA_LLM_ENDPOINT) to enable AI parsing.',
    )
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model,
  )}:generateContent?key=${encodeURIComponent(apiKey)}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1 },
    }),
  })

  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Gemini request failed (${res.status}): ${t}`)
  }

  const data = (await res.json()) as unknown
  const rawText = String(
    (data as { candidates?: Array<{ content?: { parts?: Array<{ text?: unknown }> } }> })
      ?.candidates?.[0]?.content?.parts?.[0]?.text ?? '',
  )
  const parsedJson = safeParseJson(rawText)
  return { provider: 'gemini', rawText, parsedJson }
}

