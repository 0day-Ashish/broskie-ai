// Reusable Google Gemini AI helper
// All AI calls go through this module

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Call Gemini with a prompt and get text response
 * Includes automatic retry with backoff for rate limits
 */
async function callGemini(prompt, options = {}) {
  const model = genAI.getGenerativeModel({
    model: options.model || "gemini-2.5-flash",
  });

  const maxRetries = options.maxRetries || 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (err) {
      const is429 = err.message?.includes("429") || err.message?.includes("Too Many Requests");

      if (is429 && attempt < maxRetries) {
        const waitSec = Math.min(10 * attempt, 30);
        console.log(`   ⏳ Rate limited. Retrying in ${waitSec}s (attempt ${attempt}/${maxRetries})...`);
        await sleep(waitSec * 1000);
        continue;
      }

      throw err;
    }
  }
}

/**
 * Call Gemini with forced JSON output using responseMimeType
 * This tells the model to ONLY return valid JSON, no prose
 */
async function callGeminiJSON(prompt) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      // Strip any accidental markdown fences
      const cleaned = text
        .replace(/```json\n?/gi, "")
        .replace(/```\n?/g, "")
        .trim();

      return JSON.parse(cleaned);
    } catch (err) {
      const is429 = err.message?.includes("429") || err.message?.includes("Too Many Requests");

      if (is429 && attempt < maxRetries) {
        const waitSec = Math.min(10 * attempt, 30);
        console.log(`   ⏳ Rate limited (JSON). Retrying in ${waitSec}s...`);
        await sleep(waitSec * 1000);
        continue;
      }

      // If JSON parse fails, log and rethrow
      if (err instanceof SyntaxError) {
        console.error("   ⚠️ Gemini returned invalid JSON. Raw:", err.message);
      }

      throw err;
    }
  }
}

module.exports = { callGemini, callGeminiJSON };
