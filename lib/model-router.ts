type Provider = "openrouter" | "gemini" | "local";
export type ModelMessage = { role: string; content: any };
export type ProviderAttempt = {
  provider: Provider;
  model: string;
  durationMs: number;
  outcome: "success" | "error";
  errorCode?: "missing_key" | "timeout" | "rate_limited" | "provider_error" | "empty_response" | "unknown";
};
export type OrchestrationResult = {
  text: string;
  provider: Provider;
  model: string;
  attempts: ProviderAttempt[];
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_TIMEOUT_MS = 8_000;
const DEFAULT_MAX_OUTPUT_TOKENS = 700;

export const MODEL_ROLES = {
  orchestrator: process.env.OPENROUTER_ORCHESTRATOR_MODEL || "openrouter/free",
  general: process.env.OPENROUTER_GENERAL_MODEL || "openrouter/free",
  coding: process.env.OPENROUTER_CODING_MODEL || "openrouter/free",
  reasoning: process.env.OPENROUTER_REASONING_MODEL || "openrouter/free",
  vision: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
};

function boundedEnvNumber(name: string, fallback: number, min: number, max: number) {
  const parsed = Number(process.env[name]);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, Math.floor(parsed))) : fallback;
}

function timeoutMs() {
  return boundedEnvNumber("THARA_MODEL_TIMEOUT_MS", DEFAULT_TIMEOUT_MS, 1_000, 60_000);
}

function maxOutputTokens() {
  return boundedEnvNumber("THARA_MAX_OUTPUT_TOKENS", DEFAULT_MAX_OUTPUT_TOKENS, 64, 8_192);
}

class ProviderError extends Error {
  constructor(
    message: string,
    readonly code: ProviderAttempt["errorCode"],
    readonly status?: number,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

function classifyError(error: unknown): ProviderAttempt["errorCode"] {
  if (error instanceof ProviderError) return error.code;
  if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) return "timeout";
  return "unknown";
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}) {
  return fetch(input, { ...init, signal: AbortSignal.timeout(timeoutMs()) });
}

async function readProviderError(response: Response, provider: Provider) {
  if (response.status === 429) {
    throw new ProviderError(`${provider} rate limited the request`, "rate_limited", response.status);
  }
  throw new ProviderError(`${provider} returned HTTP ${response.status}`, "provider_error", response.status);
}

export async function callModel(provider: Provider, model: string, messages: ModelMessage[]): Promise<string> {
  if (provider === "local") {
    const configuredUrl = process.env.THARA_LOCAL_MODEL_URL;
    if (!configuredUrl) throw new ProviderError("THARA_LOCAL_MODEL_URL is not configured", "missing_key");
    let endpoint: URL;
    try {
      endpoint = new URL(configuredUrl);
      if (!["http:", "https:"].includes(endpoint.protocol) || endpoint.username || endpoint.password || endpoint.hash) throw new Error("Unsupported endpoint URL");
    } catch { throw new ProviderError("THARA_LOCAL_MODEL_URL must be a valid HTTP(S) endpoint", "provider_error"); }
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (process.env.THARA_LOCAL_MODEL_API_KEY) headers.Authorization = "Bearer " + process.env.THARA_LOCAL_MODEL_API_KEY;
    const response = await fetchWithTimeout(endpoint, {
      method: "POST", headers,
      body: JSON.stringify({ model, messages, temperature: 0.2, max_tokens: maxOutputTokens(), stream: false }),
    });
    if (!response.ok) await readProviderError(response, provider);
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    const text = typeof content === "string" ? content.trim() : "";
    if (!text) throw new ProviderError("Local model returned an empty response", "empty_response");
    return text;
  }

  if (provider === "openrouter") {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new ProviderError("OPENROUTER_API_KEY is not configured", "missing_key");
    }

    const response = await fetchWithTimeout(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_ORIGIN || "http://localhost:3000",
        "X-OpenRouter-Title": "THARA Personal AI",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.2,
        max_tokens: maxOutputTokens(),
      }),
    });

    if (!response.ok) await readProviderError(response, provider);
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    const text = typeof content === "string" ? content.trim() : "";
    if (!text) throw new ProviderError("OpenRouter returned an empty response", "empty_response");
    return text;
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new ProviderError("GEMINI_API_KEY is not configured", "missing_key");
  }

  const response = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: messages.map((message) => `${message.role}: ${typeof message.content === "string" ? message.content : JSON.stringify(message.content)}`).join("\\n") }],
        }],
        generationConfig: { temperature: 0.2, maxOutputTokens: maxOutputTokens() },
      }),
    },
  );

  if (!response.ok) await readProviderError(response, provider);
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("").trim() || "";
  if (!text) throw new ProviderError("Gemini returned an empty response", "empty_response");
  return text;
}

export function getModelFallbackCandidates(): Array<{ provider: Provider; model: string }> {
  const fastModel = process.env.THARA_FAST_MODEL || process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
  const candidates: Array<{ provider: Provider; model: string }> = [
    { provider: "gemini", model: fastModel },
    { provider: "openrouter", model: MODEL_ROLES.orchestrator },
    { provider: "openrouter", model: "openrouter/free" },
  ];  // Local inference is opt-in and configured server-side; cloud fallbacks remain available.
  if (process.env.THARA_LOCAL_MODEL_URL) {
    const local = { provider: "local" as const, model: process.env.THARA_LOCAL_MODEL_NAME || "local-model" };
    if (process.env.THARA_PREFER_LOCAL === "true") candidates.unshift(local);
    else candidates.push(local);
  }

  // Avoid calling the exact same provider/model pair twice when environment
  // configuration makes the orchestrator model equal to the free fallback.
  const seen = new Set<string>();
  return candidates.filter(({ provider, model }) => {
    const key = `${provider}:${model}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Executes a bounded provider fallback chain and returns sanitized diagnostics.
 * Never includes request contents, credentials, or raw provider response bodies
 * in the trace.
 */
export async function orchestrateWithTrace(messages: ModelMessage[]): Promise<OrchestrationResult> {
  const attempts: ProviderAttempt[] = [];

  for (const candidate of getModelFallbackCandidates()) {
    const startedAt = Date.now();
    try {
      const text = await callModel(candidate.provider, candidate.model, messages);
      attempts.push({
        ...candidate,
        durationMs: Date.now() - startedAt,
        outcome: "success",
      });
      return { text, provider: candidate.provider, model: candidate.model, attempts };
    } catch (error) {
      const code = classifyError(error);
      attempts.push({
        ...candidate,
        durationMs: Date.now() - startedAt,
        outcome: "error",
        errorCode: code,
      });
    }
  }

  const summary = attempts.map((attempt) => `${attempt.provider}/${attempt.model}: ${attempt.errorCode || "unknown"}`).join("; ");
  throw new Error(`All THARA model providers failed. Attempts: ${summary}`);
}

/**
 * Backwards-compatible API for existing callers that only need the response
 * text. New orchestration code can use orchestrateWithTrace for diagnostics.
 */
export async function orchestrate(messages: ModelMessage[]): Promise<string> {
  const result = await orchestrateWithTrace(messages);
  return result.text;
}
