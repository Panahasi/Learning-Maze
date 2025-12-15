/**
 * Generates three common misspellings for a given word.
 * Calls the secure Netlify function to hide the API Key.
 */
export const generateMisspellings = async (word: string): Promise<string[]> => {
  try {
    const response = await fetch('/.netlify/functions/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'misspell', 
        word 
      }),
    });

    if (!response.ok) throw new Error("Secure function failed");
    
    const data = await response.json();
    return data.misspellings || [];
  } catch (error) {
    console.error("Error generating misspellings:", error);
    return generateFallbackMisspellings(word);
  }
};

/**
 * Generates speech audio from text using the secure proxy.
 */
export const generateSpeech = async (text: string): Promise<string | null> => {
  try {
    const response = await fetch('/.netlify/functions/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'speech', 
        text 
      }),
    });

    if (!response.ok) throw new Error("Secure function failed");
    
    const data = await response.json();
    return data.audio || null;
  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
};

const generateFallbackMisspellings = (word: string): string[] => {
    const misspellings = new Set<string>();
    if (word.length > 3) {
        const i = Math.floor(Math.random() * (word.length - 1));
        misspellings.add(word.substring(0, i) + word[i+1] + word[i] + word.substring(i+2));
    }
    if (word.length > 2) {
        const i = Math.floor(Math.random() * word.length);
        misspellings.add(word.substring(0, i) + word.substring(i + 1));
    }
    const i = Math.floor(Math.random() * word.length);
    const char = String.fromCharCode(97 + Math.floor(Math.random() * 26));
    misspellings.add(word.substring(0, i) + char + word.substring(i));
    return Array.from(misspellings).slice(0, 3);
};
