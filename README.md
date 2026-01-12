# pika
making college easier
is a centralized academic management platform designed to automate the most tedious parts of being a student. Instead of manually tracking deadlines and calculating grade percentages, users can upload their syllabus and let the platform handle the logistics. The application uses AI to structure raw syllabus data into a predictive dashboard, a visual countdown system, and an automated study planner.

Core Features
1. AI Syllabus Extraction
The "Input Engine" of the application. Users can upload a PDF or paste raw text from a syllabus. The system uses an LLM-powered parser to identify assignment names, their respective weights, and due dates, automatically populating the rest of the platform.

2. Predictive Grade Dashboard
Move beyond basic calculators. This tab allows users to:

View their current weighted average in real-time.

Set a "Target Grade" (e.g., an A) for the semester.

Calculate the exact scores required on remaining assignments and finals to achieve that target.

3. Urgency-Based Visualizer
A high-impact dashboard that displays assignments as "Countdown Cards."

Red Cards: Due in less than 24 hours.

Yellow Cards: Due in less than 3 days.

Green Cards: Due in more than 3 days.

Cards are automatically sorted by the closest deadline and feature live timers counting down in Days, Hours, and Minutes.

4. Dynamic Study Planner
An automated weekly calendar that takes the estimated effort for upcoming assignments and distributes study blocks across the week. It ensures that students start working on high-weight projects well before the deadline.

5. SMS Integration (Twilio)
A proactive notification system that bridges the gap between the web app and the student. Users receive iMessage/SMS alerts for:

Upcoming deadlines (24-hour warnings).

Daily study reminders based on the Study Planner.

"Start Now" alerts for major projects.

Tech Stack
Frontend: React.js, Tailwind CSS, Lucide Icons.

State Management: React Context API with LocalStorage persistence.

Data Parsing: OpenAI/Gemini API for syllabus text extraction.

Notifications: Twilio API for SMS delivery.

Deployment: Vercel or Netlify.

Getting Started
Clone the repository: git clone https://github.com/yourusername/syllabus-os.git

Install dependencies: npm install

Set up Environment Variables: Create a .env file and add your API keys:

REACT_APP_AI_API_KEY

REACT_APP_TWILIO_AUTH_TOKEN

Run the development server: npm start

Why Syllabus OS?
Most students fail to stay organized because the "overhead" of organization is too high. Syllabus OS removes that friction by turning a 10-page PDF document into a living, breathing schedule in seconds.
