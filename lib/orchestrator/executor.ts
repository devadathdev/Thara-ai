import { createHash } from "node:crypto";
import { planEngineeringMission } from "@/lib/engineering-planner";
import { verifyApprovalToken } from "@/lib/orchestrator/approval";
import type { MissionAction, MissionRecord } from "@/lib/orchestrator/mission";

export type ToolResult = {
  tool: MissionAction; status: "completed" | "rejected"; startedAt: number; completedAt: number;
  output?: unknown; error?: string; executionMode: "bounded-in-process";
};
const MAX_ARTIFACT_CHARS = 100_000;
function assertPlainInput(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Tool input must be an object");
  return input as Record<string, unknown>;
}

/** Registered in-process tools only. No shell, eval, arbitrary paths, or deployment. */
export async function executeApprovedTool(input: {
  uid: string; mission: MissionRecord; action: MissionAction; approvalToken: string; toolInput: unknown;
}): Promise<ToolResult> {
  const startedAt = Date.now();
  try {
    verifyApprovalToken(input.approvalToken, {
      uid: input.uid, missionId: input.mission.id, planHash: input.mission.planHash, action: input.action
    });
    if (input.mission.status !== "approved" && input.mission.status !== "running") throw new Error("Mission must be approved before execution");
    if (!input.mission.actions.includes(input.action)) throw new Error("Action is outside the mission's approved action set");
    const data = assertPlainInput(input.toolInput);
    let output: unknown;
    if (input.action === "engineering.plan") {
      const goal = typeof data.goal === "string" ? data.goal.trim().slice(0, 4000) : input.mission.goal;
      if (!goal) throw new Error("Engineering plan requires a goal");
      output = planEngineeringMission(goal);
    } else if (input.action === "artifact.sha256") {
      const content = data.content;
      if (typeof content !== "string" || content.length > MAX_ARTIFACT_CHARS) throw new Error("Artifact content must be a string no larger than 100,000 characters");
      output = { sha256: createHash("sha256").update(content, "utf8").digest("hex"), characters: content.length, bytes: Buffer.byteLength(content, "utf8") };
    } else {
      throw new Error("Tool is not registered");
    }
    return { tool: input.action, status: "completed", startedAt, completedAt: Date.now(), output, executionMode: "bounded-in-process" };
  } catch (error) {
    return { tool: input.action, status: "rejected", startedAt, completedAt: Date.now(), error: error instanceof Error ? error.message : "Tool execution rejected", executionMode: "bounded-in-process" };
  }
}
