import { randomUUID } from "node:crypto";
import { assertToolInput, getTool, listTools, type ToolContext, type ToolRisk } from "@/lib/agents/tool-registry";

export type MissionStep = {
  id: string;
  toolId: string;
  input: unknown;
  risk: ToolRisk;
  requiresApproval: boolean;
};

export type MissionPlan = {
  id: string;
  goal: string;
  steps: MissionStep[];
  status: "planned" | "approval-required" | "completed" | "failed";
};

function requiresApproval(risk: ToolRisk) {
  return risk !== "read";
}

export function planMission(goal: string, toolIds: string[] = ["thara.capability_route"]): MissionPlan {
  if (!goal.trim() || goal.length > 4000) throw new Error("Mission goal must be 1–4000 characters");
  const steps = toolIds.map((toolId, index) => {
    const tool = getTool(toolId);
    if (!tool) throw new Error(`Unknown tool: ${toolId}`);
    return {
      id: `${index + 1}-${randomUUID().slice(0, 8)}`,
      toolId,
      input: toolId === "thara.capability_route" ? { message: goal } : {},
      risk: tool.risk,
      requiresApproval: requiresApproval(tool.risk),
    };
  });
  return {
    id: randomUUID(),
    goal,
    steps,
    status: steps.some(s => s.requiresApproval) ? "approval-required" : "planned",
  };
}

export async function executeMission(plan: MissionPlan, context: ToolContext) {
  const results: Array<{ stepId: string; toolId: string; ok: boolean; output?: unknown; error?: string }> = [];
  if (plan.steps.some(s => s.requiresApproval) && !context.approved) {
    return { ...plan, status: "approval-required" as const, results };
  }

  for (const step of plan.steps) {
    const tool = getTool(step.toolId);
    if (!tool) throw new Error(`Unknown tool: ${step.toolId}`);
    assertToolInput(tool, step.input);
    try {
      const output = await tool.execute(step.input, context);
      results.push({ stepId: step.id, toolId: step.toolId, ok: true, output });
    } catch (error) {
      results.push({ stepId: step.id, toolId: step.toolId, ok: false, error: error instanceof Error ? error.message : "Tool failed" });
      return { ...plan, status: "failed" as const, results };
    }
  }
  return { ...plan, status: "completed" as const, results };
}

export { listTools };
