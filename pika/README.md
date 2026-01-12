# Pika (Student Dashboard)

Pika is a dark-mode student dashboard built with **React**, **Tailwind CSS**, and **Lucide React** icons.

## What’s inside

- **Sidebar navigation**: Dashboard, Grade Architect, Input Engine, Study Planner, Notifications
- **Unified global assignment state**: shared across all tabs via React Context + LocalStorage

### Tabs

- **Dashboard (Urgency Visualizer)**: countdown cards sorted by the closest deadline with live-updating \(D:HH:MM\) timers and red/yellow/green urgency.
- **Grade Architect (Predictive Calculator)**: current weighted average + “Goal Grade” that computes the exact average needed on remaining assignments; grouped weighted-average table.
- **AI Syllabus Extraction (Input Engine)**: wizard UI for uploading/pasting syllabus text; mocked parser populates the global assignment state.
- **Study Planner (Weekly Scheduler)**: auto-generated 7‑day calendar with 2-hour blocks distributed until due dates.
- **Notification Center (Twilio Integration)**: phone number + toggles, plus “Simulate SMS Send” which logs a Twilio-like payload to the console.

## Run

```bash
npm install
npm run dev
```

## Notes

- **Input Engine**:
  - Upload **PDF/DOCX** and Pika extracts text client-side (PDF.js + Mammoth).
  - Then Pika calls an LLM to output a **strict JSON array** of assignments and validates it before populating the app.
  - Configure one of:
    - `VITE_OPENAI_API_KEY` (+ optional `VITE_OPENAI_MODEL`)
    - `VITE_GEMINI_API_KEY` (+ optional `VITE_GEMINI_MODEL`)
    - or `VITE_PIKA_LLM_ENDPOINT` (your own serverless proxy that returns JSON)
- **Twilio is simulated**: no messages are sent; payloads are logged in the browser console.
