const { GoogleGenAI, Type, Modality } = require("@google/genai");

// Reads the key securely from Netlify Environment Variables
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const body = JSON.parse(event.body);
    const model = ai.models.get("gemini-2.5-flash");

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
      return { statusCode: 200, body: result.text };
    }

    // Handle Speech (TTS)
    if (body.action === 'speech') {
      const ttsModel = ai.models.get("gemini-2.5-flash-preview-tts");
      const result = await ttsModel.generateContent({
        contents: [{ parts: [{ text: body.text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
      });
      const audio = result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      return { statusCode: 200, body: JSON.stringify({ audio }) };
    }

  } catch (error) {
    console.error("Function Error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
