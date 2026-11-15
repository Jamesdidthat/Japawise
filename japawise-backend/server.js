"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const openai_1 = __importDefault(require("openai"));
// Load .env from the backend folder explicitly to avoid cwd issues
dotenv_1.default.config({ path: path_1.default.join(__dirname, '.env') });
dotenv_1.default.config({ path: path_1.default.join(__dirname, '.env.example'), override: false });
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const openRouterApiKey = process.env.OPENROUTER_API_KEY;
const openRouterModel = process.env.OPENROUTER_MODEL || '~openai/gpt-latest';
const openrouterClient = openRouterApiKey
    ? new openai_1.default({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: openRouterApiKey,
        dangerouslyAllowBrowser: false,
    })
    : null;
if (!openrouterClient) {
    console.warn('OPENROUTER_API_KEY not set — route requests will fail until it is configured.');
}
app.post('/api/route', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
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
        const response = yield openrouterClient.chat.completions.create({
            model: openRouterModel,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 900,
        });
        const choice = (_a = response.choices) === null || _a === void 0 ? void 0 : _a[0];
        const content = (choice === null || choice === void 0 ? void 0 : choice.message.content) !== null && (choice === null || choice === void 0 ? void 0 : choice.message.content) !== void 0 ? choice.message.content : '';
        if ((choice === null || choice === void 0 ? void 0 : choice.finish_reason) === 'length') {
            console.warn(`Route response reached the ${900}-token output limit for model ${openRouterModel}.`);
        }
        if (!content) {
            throw new Error('No content returned from OpenRouter API.');
        }
        let structured = null;
        const jsonCandidate = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
        try {
            const parsed = JSON.parse(jsonCandidate);
            if (parsed && typeof parsed === 'object')
                structured = parsed;
        }
        catch (_e) {
            const firstBrace = content.indexOf('{');
            const lastBrace = content.lastIndexOf('}');
            if (firstBrace >= 0 && lastBrace > firstBrace) {
                try {
                    const parsed = JSON.parse(content.slice(firstBrace, lastBrace + 1));
                    if (parsed && typeof parsed === 'object')
                        structured = parsed;
                }
                catch (_e) {
                    // Recover readable fields from JSON that was cut off before it closed.
                }
            }
        }
        const decodeModelString = (value) => {
            try {
                return JSON.parse(`"${value}"`);
            }
            catch (_e) {
                return value.replace(/\\n/g, ' ').replace(/\\r/g, ' ').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
            }
        };
        const stepsFromContent = (field) => {
            const values = [];
            const matcher = new RegExp(`"${field}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"?`, 'g');
            let match;
            while ((match = matcher.exec(content)) !== null)
                values.push(decodeModelString(match[1]));
            return values;
        };
        let steps = Array.isArray(structured === null || structured === void 0 ? void 0 : structured.steps)
            ? structured.steps
                .filter((step) => !!step && typeof step === 'object' && typeof step.instruction === 'string')
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
                .map((instruction, index) => ({ instruction: instruction.trim(), place: (places[index] || '').trim() }))
                .filter((step) => step.instruction);
        }
        const rawDirections = typeof (structured === null || structured === void 0 ? void 0 : structured.directions) === 'string'
            ? structured.directions
            : steps.length
                ? steps.map((step) => `\u2022 ${step.instruction}`).join('\n')
                : content;
        const looksLikeJson = /^\s*[\[{]/.test(content) || /"steps"\s*:/.test(content);
        const cleaned = (looksLikeJson && !steps.length && typeof (structured === null || structured === void 0 ? void 0 : structured.directions) !== 'string'
            ? 'I could not format this route. Please try again.'
            : rawDirections)
            .split('\n')
            .map((line) => line.trim())
            .filter((line, index, arr) => line && arr.indexOf(line) === index)
            .join('\n');
        res.status(200).json({ result: cleaned || 'No route found.', steps });
    }
    catch (err) {
        console.error('OpenRouter API error:', err);
        res.status(500).json({ error: 'Sorry, I couldn’t find a route at the moment.' });
    }
}));
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);
});
