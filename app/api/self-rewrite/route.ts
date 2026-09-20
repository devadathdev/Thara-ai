export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { verifyBearerToken } from "@/lib/firebase-admin";
import { callModel } from "@/lib/model-router";
import { applySelfRewrite, isSelfRewriteCommand, readRewriteableFiles, rewriteSystemPrompt } from "@/lib/self-rewrite";

const WINDOW_MS = 10 * 60_000;
const lastRun = new Map<string, number>();

export async function POST(req: Request) {
  try {
    const user = await verifyBearerToken(req);
    const body = await req.json();
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!isSelfRewriteCommand(message)) return NextResponse.json({ error: "Self-rewrite requires the exact authorization command." }, { status: 403 });

    const last = lastRun.get(user.uid) || 0;
    if (Date.now() - last < WINDOW_MS) return NextResponse.json({ error: "Self-rewrite is temporarily locked. Try again later." }, { status: 429 });
    lastRun.set(user.uid, Date.now());

    const files = await readRewriteableFiles();
    const prompt = `${rewriteSystemPrompt()}\n\nCURRENT ALLOWLISTED SOURCE:\n${Object.entries(files).map(([name, content]) => `\n--- ${name} ---\n${content}\n--- END ${name} ---`).join("\n")}`;
    const raw = await callModel("openrouter", process.env.OPENROUTER_CODING_MODEL || process.env.OPENROUTER_ORCHESTRATOR_MODEL || "openrouter/free", [
      { role: "system", content: prompt }, { role: "user", content: "Apply one small, safe, useful engineering improvement to THARA." },
    ]);
    let plan: { reason?: string; changes?: Record<string, string> };
    try { plan = JSON.parse(raw.replace(/^\`\`\`json\s*/i, "").replace(/\s*\`\`\`$/, "")); }
    catch { return NextResponse.json({ error: "Rewrite engine returned invalid structured output." }, { status: 502 }); }
    const changes = plan.changes && typeof plan.changes === "object" ? plan.changes : {};
    if (Object.keys(changes).length === 0) return NextResponse.json({ ok: true, changed: [], reason: plan.reason || "No safe change proposed." });
    const result = await applySelfRewrite(changes, plan.reason || "THARA self-rewrite");
    return NextResponse.json({ ok: true, changed: result.applied, backup: result.backupDir, reason: plan.reason || "Self-rewrite applied." });
  } catch (e: any) {
    console.error("self_rewrite_error", e?.message || e);
    return NextResponse.json({ error: "Self-rewrite failed safely; no secrets were exposed." }, { status: 500 });
  }
}