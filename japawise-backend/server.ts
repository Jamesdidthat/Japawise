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
  IMPORTANT OUTPUT FORMAT: Return ONLY valid JSON with this shape:
  {"steps":[{"instruction":"One complete direction bullet without its bullet symbol","place":"A real stop, junction, or landmark explicitly named in that bullet, or empty string"}]}
  Return no more than 6 concise steps, with enough detail to complete the trip and reach the destination.
  Put every direction inside the steps list in route order. Do not add guessed stops, coordinates, fares, or details. The interface adds the supplied origin and destination around the step sequence.

  You are JapaWise, a Lagos public transport assistant.

  Give the best possible danfo/keke/okada route guidance from "${from}" to "${to}" in Lagos.
  If you are unsure about a detail, do not invent specific bus stops or landmarks.
  Write one concise instruction per step, without bullet symbols; the app formats instructions as bullets.
  Keep it local, practical, and concise.
  The JSON wrapper is required; apply the bullet and ending rules below to each step instruction.
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
      max_tokens: 900,
    });

    const choice = response.choices?.[0];
    const content = choice?.message?.content ?? '';
    if (choice?.finish_reason === 'length') {
      console.warn(`Route response reached the ${900}-token output limit for model ${openRouterModel}.`);
    }

    if (!content) {
      throw new Error('No content returned from OpenRouter API.');
    }

    let structured: { directions?: unknown; steps?: unknown } | null = null;
    const jsonCandidate = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    try {
      const parsed: unknown = JSON.parse(jsonCandidate);
      if (parsed && typeof parsed === 'object') structured = parsed as { directions?: unknown; steps?: unknown };
    } catch {
      const firstBrace = content.indexOf('{');
      const lastBrace = content.lastIndexOf('}');
      if (firstBrace >= 0 && lastBrace > firstBrace) {
        try {
          const parsed: unknown = JSON.parse(content.slice(firstBrace, lastBrace + 1));
          if (parsed && typeof parsed === 'object') structured = parsed as { directions?: unknown; steps?: unknown };
        } catch {
          // Recover readable fields from JSON that was cut off before it closed.
        }
      }
    }

    const decodeModelString = (value: string) => {
      try {
        return JSON.parse(`"${value}"`) as string;
      } catch {
        return value.replace(/\\n/g, ' ').replace(/\\r/g, ' ').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      }
    };
    const stepsFromContent = (field: 'instruction' | 'place') => {
      const values: string[] = [];
      const matcher = new RegExp(`"${field}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"?`, 'g');
      let match: RegExpExecArray | null;
      while ((match = matcher.exec(content)) !== null) values.push(decodeModelString(match[1]));
      return values;
    };

    let steps = Array.isArray(structured?.steps)
      ? structured.steps
          .filter((step): step is { instruction: string; place?: string } =>
            !!step && typeof step === 'object' && typeof (step as { instruction?: unknown }).instruction === 'string')
          .map((step) => ({
            instruction: step.instruction.trim(),
            place: typeof step.place === 'string' ? step.place.trim() : '',
          }))
          .filter((step) => step.instruction)
      : [];
    if (!steps.length) {
      const instructions = stepsFromContent('instruction');
      const places = stepsFromContent('place');
      steps = instructions
        .map((instruction, index) => ({ instruction: instruction.trim(), place: places[index]?.trim() ?? '' }))
        .filter((step) => step.instruction);
    }
    const rawDirections = typeof structured?.directions === 'string'
      ? structured.directions
      : steps.length
        ? steps.map((step) => `\u2022 ${step.instruction}`).join('\n')
        : content;
    const looksLikeJson = /^\s*[\[{]/.test(content) || /"steps"\s*:/.test(content);
    const cleaned = (looksLikeJson && !steps.length && typeof structured?.directions !== 'string'
      ? 'I could not format this route. Please try again.'
      : rawDirections)
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string, index: number, arr: string[]) => line && arr.indexOf(line) === index)
      .join('\n');
    res.status(200).json({ result: cleaned || 'No route found.', steps });
  } catch (err) {
    console.error('OpenRouter API error:', err);
    res.status(500).json({ error: 'Sorry, I couldn’t find a route at the moment.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
