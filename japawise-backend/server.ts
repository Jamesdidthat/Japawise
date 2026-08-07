import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import OpenAI from 'openai';


// Load .env from the backend folder explicitly to avoid cwd issues
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '.env.example'), override: false });
const app = express();
app.use(cors());
app.use(express.json());

const openRouterApiKey = process.env.OPENROUTER_API_KEY;
const openRouterModel = process.env.OPENROUTER_MODEL || '~openai/gpt-latest';
const openrouterClient = openRouterApiKey
  ? new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: openRouterApiKey,
      dangerouslyAllowBrowser: false,
    })
  : null;

if (!openrouterClient) {
  console.warn('OPENROUTER_API_KEY not set — route requests will fail until it is configured.');
}

app.post('/api/route', async (req, res) => {
  const { from, to } = req.body;

  const prompt = `
  You are JapaWise, a Lagos public transport assistant.

  Give the best possible danfo/keke/okada route guidance from "${from}" to "${to}" in Lagos.
  If you are unsure about a detail, do not invent specific bus stops or landmarks.
  Use short bullet points only with the • symbol.
  Keep it local, practical, and concise.
  Mention known Lagos landmarks only when useful.
  End with: “You’ve reached ${to}!”.
  `;

  try {
    if (!openrouterClient) {
      res.status(500).json({ error: 'OPENROUTER_API_KEY is not configured.' });
      return;
    }

    const response = await openrouterClient.chat.completions.create({
      model: openRouterModel,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 400,
    });

    const content = response.choices?.[0]?.message?.content ?? '';

    if (!content) {
      throw new Error('No content returned from OpenRouter API.');
    }

    const cleaned = content
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string, index: number, arr: string[]) => line && arr.indexOf(line) === index)
      .join('\n');

    res.status(200).json({ result: cleaned || 'No route found.' });
  } catch (err) {
    console.error('OpenRouter API error:', err);
    res.status(500).json({ error: 'Sorry, I couldn’t find a route at the moment.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});