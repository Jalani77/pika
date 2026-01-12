export function buildAssignmentsPrompt(extractedText: string) {
  // Strict “JSON only” instructions + guardrails for common syllabus ambiguity.
  // The downstream validator will reject anything that isn't a JSON array of assignment objects.
  return `You are extracting structured assignment data from a course syllabus.

Return ONLY a JSON array. No markdown, no backticks, no commentary, no wrapper object.

Each array item MUST be an object with EXACT keys:
- "name": string (assignment name)
- "type": one of "exam" | "homework" | "project"
- "weight": number (percentage points 0-100 for THIS assignment; if only category weight is given and individual weight is ambiguous, set weight to 0)
- "score": number|null (null if not graded yet)
- "due_date": string (ISO date "YYYY-MM-DD"; if syllabus omits year, infer the most reasonable year: use current year unless the date clearly already passed by >30 days, then use next year)
- "estimated_hours": number (>=0; if missing, estimate: homework=2, exam=6, project=10)

Edge cases:
- Missing year: infer as described above, always output YYYY-MM-DD.
- Ambiguous weights (e.g., “Homework 20%” without per-item weights): keep each homework item but set its weight to 0 unless the syllabus provides a clear per-item weight.
- If a due date is “TBD” or missing, choose today's date (still output YYYY-MM-DD).
- If multiple dates appear, choose the most likely due/submission date.

Extract assignments from the following text:
"""${extractedText}"""`
}

