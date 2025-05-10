import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

app.post('/api/route', async (req, res) => {
  const { from, to } = req.body;

  const prompt = `Give simple danfo/keke directions from ${from} to ${to} in Lagos. Use bullet points. Be local and clear. End with “You’ve reached ${to}!”
  
  Don't use '*' when answering. Just use '•' for bullet points. Don't use '1.', '2.', etc. You can also include instance where okada is necessary.
  `;

  try {
    const response = await openrouter.chat.completions.create({
      model: "tngtech/deepseek-r1t-chimera:free",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error("No choices returned from OpenRouter.");
    }

    const content = response.choices[0].message.content || '';

    const cleaned = content
      .split('\n')
      .filter((line, index, arr) => arr.indexOf(line) === index)
      .join('\n');

    res.json({ result: cleaned || 'No route found.' });
  } catch (err) {
    console.error("OpenRouter API error:", err);
    res.status(500).json({ error: "Sorry, I couldn’t find a route at the moment." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
