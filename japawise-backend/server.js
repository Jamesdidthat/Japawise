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
        const response = yield openrouterClient.chat.completions.create({
            model: openRouterModel,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 400,
        });
        const content = (_d = (_c = (_b = (_a = response.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) !== null && _d !== void 0 ? _d : '';
        if (!content) {
            throw new Error('No content returned from OpenRouter API.');
        }
        const cleaned = content
            .split('\n')
            .map((line) => line.trim())
            .filter((line, index, arr) => line && arr.indexOf(line) === index)
            .join('\n');
        res.status(200).json({ result: cleaned || 'No route found.' });
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
