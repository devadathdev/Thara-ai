import test from "node:test";
import assert from "node:assert/strict";
import { getModelFallbackCandidates } from "../lib/model-router";

const names = ["THARA_LOCAL_ONLY","THARA_LOCAL_MODEL_URL","THARA_LOCAL_MODEL_NAME","THARA_PREFER_LOCAL","GEMINI_API_KEY","OPENROUTER_API_KEY"] as const;
const saved = new Map<string,string|undefined>();
test.beforeEach(() => { saved.clear(); for (const key of names) saved.set(key, process.env[key]); });
test.afterEach(() => { for (const key of names) { const value=saved.get(key); if(value===undefined)delete process.env[key]; else process.env[key]=value; } });

test("local-only mode is the default and never offers cloud fallbacks", () => {
  delete process.env.THARA_LOCAL_ONLY;
  delete process.env.THARA_LOCAL_MODEL_URL;
  delete process.env.THARA_LOCAL_MODEL_NAME;
  assert.deepEqual(getModelFallbackCandidates(), [{provider:"local",model:"llama3.2:3b"}]);
});

test("cloud routing requires an explicit opt-out", () => {
  process.env.THARA_LOCAL_ONLY = "false";
  delete process.env.THARA_LOCAL_MODEL_URL;
  const candidates = getModelFallbackCandidates();
  assert.ok(candidates.some(candidate => candidate.provider === "gemini"));
  assert.ok(candidates.some(candidate => candidate.provider === "openrouter"));
  assert.ok(!candidates.some(candidate => candidate.provider === "local"));
});

test("explicit local preference only applies after cloud routing is enabled", () => {
  process.env.THARA_LOCAL_ONLY = "false";
  process.env.THARA_LOCAL_MODEL_URL = "http://127.0.0.1:11434/v1/chat/completions";
  process.env.THARA_PREFER_LOCAL = "true";
  assert.equal(getModelFallbackCandidates()[0].provider, "local");
});
