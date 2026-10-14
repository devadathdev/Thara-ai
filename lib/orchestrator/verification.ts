import { createHash } from "node:crypto";
import type { ToolResult } from "@/lib/orchestrator/executor";

export type VerificationReport = { passed: boolean; checks: string[]; artifactSha256?: string; completedAt: number };

export function verifyToolResult(result: ToolResult, expectedTool: string): VerificationReport {
  const checks: string[] = [];
  let passed = true;
  if (result.status === "completed") checks.push("tool-reported-completed");
  else { checks.push("tool-rejected"); passed = false; }
  if (result.tool === expectedTool) checks.push("tool-identity-matches");
  else { checks.push("tool-identity-mismatch"); passed = false; }
  let artifactSha256: string | undefined;
  if (result.status === "completed" && result.output !== undefined) {
    artifactSha256 = createHash("sha256").update(JSON.stringify(result.output)).digest("hex");
    checks.push("output-present", "output-hash-recorded");
  } else { checks.push("output-missing"); passed = false; }
  return { passed, checks, artifactSha256, completedAt: Date.now() };
}
