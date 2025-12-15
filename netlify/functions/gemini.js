const { GoogleGenAI, Type, Modality } = require("@google/genai");

// Reads the key securely from Netlify Environment Variables
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const body = JSON.parse(event.body);
    const model = ai.models.get("gemini-2.5-flash"); // Standard LLM model

    // Handle Misspellings
    if (body.action === 'misspell') {
      const result = await model.generateContent({
        contents: `Generate three common, distinct misspellings for the word "${body.word}". Do not include the correct spelling in the output.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              misspellings: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["misspellings"],
          },
        },
      });
      
      // The result.text IS the JSON string, return it directly with the correct header
      return { 
        statusCode: 200, 
        headers: { "Content-Type": "application/json" }, // <-- ADDED HEADER
        body: result.text 
      };
    }

    // Handle Speech (TTS)
    if (body.action === 'speech') {
      // 1. FIXED MODEL NAME: Using the current, stable TTS model name
      const ttsModel = ai.models.get("gemini-2.5-flash-tts"); 
      
      const result = await ttsModel.generateContent({
        contents: [{ parts: [{ text: body.text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
      });
      
      const base64Audio = result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      
      // Return the audio data as a JSON object
      return { 
        statusCode: 200, 
        headers: { "Content-Type": "application/json" }, // <-- ADDED HEADER
        body: JSON.stringify({ audio: base64Audio }) 
      };
    }

    // If no action is specified
    return { statusCode: 400, body: JSON.stringify({ error: "No action specified" }) };

  } catch (error) {
    console.error("Function Error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: `Function failed: ${error.message}` }) };
  }
};
