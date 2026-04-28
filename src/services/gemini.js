import { GoogleGenAI } from '@google/genai';

let ai = null;

function getAI() {
  if (ai) return ai;
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return null;
  }
  ai = new GoogleGenAI({ apiKey });
  return ai;
}

/**
 * Summarize a community need / task description.
 */
export async function summarizeTask(description) {
  const client = getAI();
  if (!client) return null;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an AI assistant for an NGO volunteer coordination platform. 
Summarize the following community need in 2-3 concise sentences. Focus on the key problem, who is affected, and what help is needed.

Community Need Description:
${description}

Provide ONLY the summary, no extra formatting.`,
    });
    return response.text?.trim() || null;
  } catch (err) {
    console.warn('Gemini summarize failed:', err.message);
    return null;
  }
}

/**
 * Suggest priority level for a task.
 */
export async function suggestPriority(title, description) {
  const client = getAI();
  if (!client) return null;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an AI assistant helping NGOs prioritize community needs.
Based on the following task, suggest a priority level.

Task Title: ${title}
Task Description: ${description}

Respond with ONLY one word: "low", "medium", or "high"`,
    });
    const text = response.text?.trim().toLowerCase();
    if (['low', 'medium', 'high'].includes(text)) return text;
    return null;
  } catch (err) {
    console.warn('Gemini priority suggestion failed:', err.message);
    return null;
  }
}

/**
 * Generate an AI explanation for why a volunteer was matched to a task.
 */
export async function explainMatch(task, volunteer, score) {
  const client = getAI();
  if (!client) return null;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an AI assistant for volunteer coordination. Explain in 2-3 sentences why this volunteer is a good match for this task. Be specific and human-readable.

Task: "${task.title}" - ${task.description}
Required Skills: ${task.requiredSkills?.join(', ')}
Task Location: ${task.location}
Task Urgency: ${task.urgency}

Volunteer: ${volunteer.name}
Volunteer Skills: ${volunteer.skills?.join(', ')}
Volunteer Location: ${volunteer.location}
Available: ${volunteer.availability ? 'Yes' : 'No'}

Match Score: ${score}%

Provide ONLY the explanation, no extra formatting or labels.`,
    });
    return response.text?.trim() || null;
  } catch (err) {
    console.warn('Gemini match explanation failed:', err.message);
    return null;
  }
}

/**
 * Check if Gemini API is available.
 */
export function isGeminiAvailable() {
  return getAI() !== null;
}
