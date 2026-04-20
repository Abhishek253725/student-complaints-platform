const OpenAI = require('openai');

const CRITICAL_KEYWORDS = ['ragging', 'harassment', 'danger', 'violence', 'threat', 'assault', 'abuse', 'fire'];

// Fallback local analyzer when no API key
function localAnalyze(description) {
  const lower = description.toLowerCase();

  const hasCritical = CRITICAL_KEYWORDS.some(kw => lower.includes(kw));

  let category = 'Other';
  if (/wifi|internet|infra|chair|lab|hostel|building|room|facility|electricity|water|toilet/.test(lower)) category = 'Infrastructure';
  else if (/exam|library|book|teacher|class|course|academic|study|syllabus|marks|result/.test(lower)) category = 'Academic';
  else if (/ragging|harass|danger|violence|safe|fire|chemical|injury|accident|security/.test(lower)) category = 'Safety';

  let priorityScore = 30 + Math.floor(Math.random() * 30);
  if (hasCritical) priorityScore = 85 + Math.floor(Math.random() * 15);
  else if (category === 'Safety') priorityScore = Math.max(priorityScore, 65);
  else if (category === 'Infrastructure') priorityScore = Math.max(priorityScore, 40);

  const priorityLevel =
    priorityScore >= 80 ? 'Critical' :
    priorityScore >= 60 ? 'High' :
    priorityScore >= 40 ? 'Medium' : 'Low';

  const summary = description.length > 150
    ? description.substring(0, 150).trim() + '...'
    : description;

  return { category, priorityScore, priorityLevel, summary };
}

async function analyzeComplaint(description) {
  // Use OpenAI if key is set
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key') {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const prompt = `You are an AI assistant for a student grievance platform. Analyze the following complaint and respond ONLY with a valid JSON object.

Complaint: "${description}"

Respond with this exact JSON format:
{
  "category": "Academic|Infrastructure|Safety|Other",
  "priorityScore": <number 0-100>,
  "priorityLevel": "Low|Medium|High|Critical",
  "summary": "<one sentence summary under 100 chars>"
}

Rules:
- Mark "Critical" and score 90+ if complaint mentions: ragging, harassment, violence, danger, threat, assault
- Mark "High" (60-79) for safety or urgent infrastructure issues
- Mark "Medium" (40-59) for academic or moderate issues  
- Mark "Low" (0-39) for minor suggestions`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.3,
      });

      const text = response.choices[0].message.content.trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          category: parsed.category || 'Other',
          priorityScore: Math.min(100, Math.max(0, parseInt(parsed.priorityScore) || 30)),
          priorityLevel: parsed.priorityLevel || 'Low',
          summary: parsed.summary || description.substring(0, 100),
        };
      }
    } catch (err) {
      console.warn('OpenAI failed, using local analyzer:', err.message);
    }
  }

  // Fallback
  return localAnalyze(description);
}

module.exports = { analyzeComplaint };
