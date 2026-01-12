# Pika

Pika is a dark-mode student dashboard that turns assignments into a live urgency view, a predictive grade calculator, an input “wizard” for syllabus extraction, an automated weekly study planner, and a notification settings center.

The app lives in `pika/`.

## Run locally

```bash
cd pika
npm install
npm run dev
```

## Tech

- **Frontend**: React + TypeScript (Vite)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State**: React Context with LocalStorage persistence

## Input Engine (LLM parsing)

To enable syllabus-to-assignments parsing, set either:
- `VITE_OPENAI_API_KEY` (optional `VITE_OPENAI_MODEL`)
- `VITE_GEMINI_API_KEY` (optional `VITE_GEMINI_MODEL`)

Or set `VITE_PIKA_LLM_ENDPOINT` to your own serverless proxy that returns the JSON array.
