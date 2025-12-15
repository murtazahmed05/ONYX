
import { GoogleGenAI } from "@google/genai";
import { AppState, ChatMessage } from "../types";

// Initialize AI Client following the pattern: new GoogleGenAI({ apiKey: process.env.API_KEY })
const getClient = () => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const sendMessageToGemini = async (
  history: ChatMessage[],
  newMessage: string,
  contextData: AppState
): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Error: API Key is missing. Please check your configuration.";

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
    - Notes: ${contextData.notes.map(n => n.title).join(', ')}
  `;

  const systemInstruction = `
    You are a helpful productivity assistant integrated into the Onyx app.
    ${contextSummary}
    INSTRUCTIONS:
    - Be concise, direct, and helpful. 
    - Maintain the "minimalist, jet-black" persona of the app.
    - Analyze the user's workload and suggest priorities if asked.
    - If the user asks about progress, calculate it based on the data provided.
  `;

  try {
    // Correctly call generateContent with model and contents parameters
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        ...history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        })),
        { role: 'user', parts: [{ text: newMessage }] }
      ],
      config: {
        systemInstruction: systemInstruction
      }
    });

    // Directly access the .text property from GenerateContentResponse
    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the network right now.";
  }
};