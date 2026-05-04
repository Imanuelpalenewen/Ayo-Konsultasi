"use node";

import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Single entry point for all AI calls in this codebase.
 * Reads AI_PROVIDER env var ("gemini" | "mistral"). Defaults to "gemini".
 * Auto-falls back to Mistral when Gemini hits a rate-limit (429/quota),
 * provided MISTRAL_API_KEY is configured.
 *
 * IMPORTANT: This function throws on failure — callers are responsible for
 * catching and providing their own user-facing fallback message.
 */
export async function callAI(prompt: string): Promise<string> {
  const provider = process.env.AI_PROVIDER ?? "gemini";
  console.log(`[aiProvider] Using provider: ${provider}`);

  if (provider === "mistral") {
    return callMistral(prompt);
  }

  try {
    return await callGemini(prompt);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
    const isRateLimit = msg.includes("429") || msg.includes("quota") || msg.includes("rate");
    if (isRateLimit && process.env.MISTRAL_API_KEY) {
      console.warn("[aiProvider] Gemini rate limit — falling back to Mistral");
      return callMistral(prompt);
    }
    // Re-throw so the caller can handle it; don't silently return a string
    throw err;
  }
}

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY tidak dikonfigurasi di Convex Dashboard.");
  const modelName = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  console.log(`[aiProvider] Calling Gemini model: ${modelName}`);
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  console.log(`[aiProvider] Gemini response length: ${text.length} chars`);
  return text;
}

async function callMistral(prompt: string): Promise<string> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error("MISTRAL_API_KEY tidak dikonfigurasi di Convex Dashboard.");
  console.log("[aiProvider] Calling Mistral mistral-small-latest");
  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "mistral-small-latest",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Mistral API error ${response.status}: ${body}`);
  }
  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };
  const text = data.choices[0].message.content;
  console.log(`[aiProvider] Mistral response length: ${text.length} chars`);
  return text;
}
