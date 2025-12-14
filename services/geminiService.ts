
import { GoogleGenAI, Type, Modality } from "@google/genai";

// Ensure the API key is available in the environment variables
if (!process.env.API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this context, we assume it's set.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

/**
 * Generates three common misspellings for a given word using the Gemini API.
 * @param word The correctly spelled word.
 * @returns A promise that resolves to an array of three misspelled words.
 */
export const generateMisspellings = async (word: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate three common, distinct misspellings for the word "${word}". Do not include the correct spelling in the output.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            misspellings: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
                description: "A common misspelling of the word.",
              },
            },
          },
          required: ["misspellings"],
        },
      },
    });

    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);
    
    if (parsed.misspellings && Array.isArray(parsed.misspellings)) {
      // Ensure we only return up to 3 misspellings
      return parsed.misspellings.slice(0, 3);
    }
    return [];
  } catch (error) {
    console.error("Error generating misspellings with Gemini:", error);
    // Fallback to simpler, programmatic misspellings if API fails
    return generateFallbackMisspellings(word);
  }
};

/**
 * Generates speech audio from text using the Gemini TTS API.
 * @param text The text to convert to speech.
 * @returns A promise that resolves to a base64 encoded audio string, or null on failure.
 */
export const generateSpeech = async (text: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }, // A friendly, clear voice
            },
        },
      },
    });
    
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return base64Audio;
    }
    return null;
  } catch (error) {
    console.error("Error generating speech with Gemini:", error);
    return null;
  }
};


/**
 * A fallback function to generate simple misspellings if the Gemini API fails.
 * This provides basic functionality without relying on the API.
 * @param word The word to misspell.
 * @returns An array of simple misspellings.
 */
const generateFallbackMisspellings = (word: string): string[] => {
    const misspellings = new Set<string>();
    if (word.length > 3) {
        // Swap two adjacent letters
        const i = Math.floor(Math.random() * (word.length - 1));
        misspellings.add(word.substring(0, i) + word[i+1] + word[i] + word.substring(i+2));
    }
    if (word.length > 2) {
        // Remove a letter
        const i = Math.floor(Math.random() * word.length);
        misspellings.add(word.substring(0, i) + word.substring(i + 1));
    }
    // Add a letter
    const i = Math.floor(Math.random() * word.length);
    const char = String.fromCharCode(97 + Math.floor(Math.random() * 26));
    misspellings.add(word.substring(0, i) + char + word.substring(i));
    
    return Array.from(misspellings).slice(0, 3);
};
