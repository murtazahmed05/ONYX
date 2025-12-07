import { GoogleGenAI } from "@google/genai";
import { AppState, ChatMessage } from "../types";

// Initialize AI Client
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const sendMessageToGemini = async (
  history: ChatMessage[],
  newMessage: string,
  contextData: AppState
): Promise<string> => {
  const client = getClient();
  if (!client) return "Error: API Key is missing. Please check your configuration.";

  // Prepare system context from App State
  const contextSummary = `
    You are Onyx, a highly intelligent and minimal productivity assistant.
    Current Date: ${new Date().toLocaleDateString()}
    
    USER DATA:
    - Daily Habits: ${contextData.tasks.filter(t => t.type === 'daily').map(t => `${t.title} (${t.completed ? 'Done' : 'Pending'})`).join(', ')}
    - Short Term Tasks: ${contextData.tasks.filter(t => t.type === 'short_term').map(t => `${t.title} [${t.priority}]`).join(', ')}
    - Long Term Operations: ${contextData.tasks.filter(t => t.type === 'long_term').map(t => `${t.title} (Due: ${t.dueDate})`).join(', ')}
    - Life Areas: ${contextData.areas.map(a => a.name).join(', ')}
    - Life Milestones: ${contextData.milestones.map(m => `${m.title} (${m.completed ? 'Achieved' : 'In Progress'})`).join(', ')}
    - Upcoming Events: ${contextData.events.map(e => `${e.title} on ${e.date}`).join(', ')}

    INSTRUCTIONS:
    - Be concise, direct, and helpful. 
    - Maintain the "minimalist, jet-black" persona of the app.
    - Analyze the user's workload and suggest priorities if asked.
    - If the user asks about progress, calculate it based on the data provided.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `System Context: ${contextSummary}` }] }, // Priming the model with context in the first message turn invisible to user effectively or appended
        ...history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        })),
        { role: 'user', parts: [{ text: newMessage }] }
      ],
      config: {
        systemInstruction: "You are a helpful productivity assistant integrated into the Onyx app."
      }
    });

    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the network right now.";
  }
};