# Pika
SYLLABUS
Pika is a dark-mode student dashboard that turns assignments into a live urgency view, a predictive grade calculator, an input “wizard” for syllabus extraction, an automated weekly study planner, and a notification settings center.

## Run locally

```bash
npm install
npm run dev
```

## Tech

- **Frontend**: React (Vite)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State**: React Context with LocalStorage persistence

## Features

- **Dashboard**: Urgency Visualizer with countdown cards
- **Grade Architect**: Predictive grade calculator and course analysis
- **Syllabus Extraction**: AI-powered PDF parsing to auto-populate assignments
- **Study Planner**: Weekly scheduler based on assignment deadlines
- **Notification Center**: Settings for deadline alerts and daily reminders

## Syllabus Parsing (AI)

The syllabus extraction feature requires an OpenAI API Key. You can input this directly in the UI when uploading a syllabus. The key is used only for the local session and is not stored.
