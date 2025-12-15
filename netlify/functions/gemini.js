// This file runs securely on the Netlify server

const { GoogleGenAI } = require("@google/genai");

// The key is read from your Netlify Environment Variables (GEMINI_API_KEY)
// and is available only here, on the server.
const ai = new GoogleGenAI({});

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { prompt } = JSON.parse(event.body);

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", // Use the model your app needs
        contents: [
            { role: "user", parts: [{ text: prompt }] }
        ]
    });

    // Send the AI's response back to your client-side React app
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: response.text,
      }),
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to generate content securely." }),
    };
  }
};
