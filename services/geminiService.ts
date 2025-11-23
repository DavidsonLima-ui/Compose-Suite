import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini API
// Note: In a production environment, ensure this is handled securely.
// For this prototype, we assume process.env.API_KEY is injected.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTextEnhancement = async (currentText: string, instruction: string): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("No API Key provided for Gemini.");
    return "Simulation: API Key missing. This is a simulated AI response.";
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      You are an intelligent writing assistant in a productivity app called "Compose".
      
      Context text: "${currentText}"
      
      User Instruction: "${instruction}"
      
      Return ONLY the enhanced or generated text. Do not add conversational filler.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I couldn't process that request right now.";
  }
};

export const generateSpreadsheetData = async (topic: string): Promise<any[]> => {
     if (!process.env.API_KEY) {
        // Fallback mock data
        return [
            { category: 'Q1', value: 4000 },
            { category: 'Q2', value: 3000 },
            { category: 'Q3', value: 2000 },
            { category: 'Q4', value: 2780 },
        ];
      }

      try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate spreadsheet data for the topic: "${topic}".`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            label: { type: Type.STRING },
                            value: { type: Type.NUMBER }
                        },
                        required: ["label", "value"]
                    }
                }
            }
        });
        
        const text = response.text;
        return text ? JSON.parse(text) : [];
      } catch (e) {
          console.error(e);
          return [];
      }
}