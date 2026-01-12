export const parseSyllabusWithLLM = async (text, apiKey) => {
  if (!apiKey) {
    throw new Error("API Key is required");
  }

  const systemPrompt = `You are a precise academic syllabus data extractor. 
Your goal is to extract assignments, exams, projects, and their details from the provided syllabus text.
Current Date: ${new Date().toISOString()}

Rules:
1. Return ONLY valid JSON. No markdown formatting (no \`\`\`json).
2. Structure the JSON as:
{
  "assignments": [
    {
      "name": "Assignment Name",
      "type": "exam" | "homework" | "project" | "other",
      "weight": number (0-100),
      "due_date": "ISO-8601 string",
      "estimated_hours": number (integer estimate),
      "course": "Course Name (inferred)"
    }
  ]
}
3. If a specific date is not found, infer a reasonable date based on the syllabus timeline (e.g. "Week 5" -> 5 weeks from start). If no timeline exists, default to 1-2 weeks from now.
4. "weight" should be the percentage of the final grade. If not specified, estimate based on assignment type (e.g. Exams higher than Homework).
5. "estimated_hours": Estimate based on complexity (Exam: 10-20, Project: 10-30, Homework: 2-5).
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Extract assignments from this syllabus:\n\n${text.slice(0, 15000)}` } // Truncate to avoid context limits if huge
        ],
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    // Clean potential markdown code blocks
    if (content.startsWith('```json')) content = content.replace(/^```json/, '').replace(/```$/, '');
    else if (content.startsWith('```')) content = content.replace(/^```/, '').replace(/```$/, '');
    
    return JSON.parse(content);
  } catch (error) {
    console.error("LLM Extraction Error:", error);
    throw error;
  }
};
