
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // only during development
});

export const getRouteFromOpenAI = async (from: string, to: string): Promise<string> => {
  // 🔥 YOUR PROMPT GOES HERE
  const prompt = `Give simple danfo or public transport directions from ${from} to ${to} in Lagos, Nigeria. Use bullet points. Be brief, clear, and local in tone.`;

  console.log("Sending this prompt to OpenAI:", prompt);
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.6,
    });
    
    console.log("OpenAI response:", response);
    
    return response.choices[0].message.content || 'No route found.';
  } catch (err) {
    console.error("OpenAI API error:", err);
    throw err; // Re-throw the error so we can see the actual error details
  }
};