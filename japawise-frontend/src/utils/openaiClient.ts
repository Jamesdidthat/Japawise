import { OpenAI } from 'openai';

const openrouterClient = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // only during development – move to backend for production
});

export const getRouteFromOpenAI = async (from: string, to: string): Promise<string> => {
  const prompt = `Give simple danfo/keke directions from ${from} to ${to} in Lagos. Use bullet points. Be local and clear. End with “You’ve reached ${to}!”
  
  Don't use '*' when answering. Just use '•' for bullet points. Don't use '1.', '2.', etc. Be specific on the names of the bus stops, junctions, and landmarks.`;



  console.log("Sending this prompt to OpenRouter:", prompt);

  try {
    const response = await openrouterClient.chat.completions.create({
      model: "tngtech/deepseek-r1t-chimera:free",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.6,
    });

    console.log("Full response from OpenRouter:", response);

    if (!response.choices || response.choices.length === 0) {
      throw new Error("No choices returned from OpenRouter.");
    }

    const content = response.choices[0].message.content || '';

    // Optional: Remove duplicate lines just in case
    const cleaned = content
      .split('\n')
      .filter((line, index, arr) => arr.indexOf(line) === index)
      .join('\n');

    return cleaned || 'No route found.';
  } catch (err) {
    console.error("OpenRouter API error:", err);
    return 'Sorry, I couldn’t find a route at the moment.';
  }
};
