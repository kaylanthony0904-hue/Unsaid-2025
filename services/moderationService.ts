
import { GoogleGenAI } from "@google/genai";
import { BLACKLISTED_WORDS } from "../constants.ts";

export async function moderateContent(text: string): Promise<{ safe: boolean; reason?: string }> {
  // Simple check
  const lowerText = text.toLowerCase();
  for (const word of BLACKLISTED_WORDS) {
    if (lowerText.includes(word)) {
      return { safe: false, reason: "Contains prohibited language." };
    }
  }

  // AI-powered refinement
  try {
    // Instantiate inside the call to ensure fresh environment/key usage
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Determine if the following message for a student publication is safe, respectful, and lacks severe profanity or harassment. Reply with a JSON object: { "safe": boolean, "reason": string }. Message: "${text}"`,
      config: {
        responseMimeType: "application/json"
      }
    });

    const textOutput = response.text;
    if (!textOutput) return { safe: true };

    const result = JSON.parse(textOutput);
    return result;
  } catch (error) {
    console.error("Moderation AI error:", error);
    return { safe: true }; // Default to safe if AI fails but simple check passed
  }
}
