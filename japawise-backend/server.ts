import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}
const genAI = new GoogleGenerativeAI(geminiApiKey); // Initialize with the apiKey property

app.post('/api/route', async (req, res) => {
  const { from, to } = req.body;

  const prompt = `
  Give simple danfo or keke or okada public transport directions from "${from}" to "${to}" in Lagos, Nigeria. 

  Instructions:
  - Prioritiz danfo public transport directions.
  - Start with clear bullet points only. Use the • symbol for each step.
  - Take into consideration the minor roads/routes that allows for the use of okada or keke.
  - Use a friendly, local, and concise tone.
  - Mention notable Lagos landmarks and local language (like “Underbridge”, “tell conductor”, “come down”).
  - Don’t include thinking, alternatives, analysis, or “let me think” type responses.
  - Keep it brief, local, and clear
  - Do NOT use a numbered list. Use bullet points (•) only.
  - End the response with: “You’ve reached ${to}!”.
  `;

  try {
    // For Gemini, you select the model and then create a chat session
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const chat = model.startChat({
      history: [
        // You can add past messages here if you want to maintain conversation context.
        // For a single-turn prompt like this, it's not strictly necessary.
      ],
      generationConfig: {
        temperature: 0.6,
      },
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const content = response.text(); // Get the text content from the Gemini response

    if (!content) {
      throw new Error("No content returned from Gemini API.");
    }

    // Clean up: remove duplicates, empty lines, and trim spacing
    const cleaned = content
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: any, index: any, arr: string | any[]) => line && arr.indexOf(line) === index)
      .join('\n');

    res.status(200).json({ result: cleaned || 'No route found.' });
  } catch (err) {
    console.error("Gemini API error:", err);
    res.status(500).json({ error: "Sorry, I couldn’t find a route at the moment." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});