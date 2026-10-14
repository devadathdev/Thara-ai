import { createHash, randomUUID } from "node:crypto";

export type MissionStatus =
  | "planned"
  | "awaiting_approval"
  | "approved"
  | "running"
  | "verification_failed"
  | "verified"
  | "failed"
  | "cancelled";

export type MissionAction = "engineering.plan" | "artifact.sha256";

export type MissionRecord = {
  id: string;
  title: string;
  goal: string;
  status: MissionStatus;
  actions: MissionAction[];
  planHash: string;
  plan: string[];
  approvalRequired: true;
  approvalId?: string;
  createdAt: number;
  updatedAt: number;
  verifiedAt?: number;
  verification?: {
    passed: boolean;
    checks: string[];
    artifactSha256?: string;
    completedAt: number;
  };
};

export function stableHash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function createMissionRecord(input: unknown): MissionRecord {
  const body = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const goal = typeof body.goal === "string" ? body.goal.trim().slice(0, 4000) : "";
  const title = (typeof body.title === "string" ? body.title.trim() : "") || "THARA Engineering Mission";
  const requestedActions = Array.isArray(body.actions) ? body.actions : [];
  const actions = requestedActions.filter((item): item is MissionAction =>
    item === "engineering.plan" || item === "artifact.sha256"
  );
  const plan = Array.isArray(body.steps)
    ? body.steps.filter((step): step is string => typeof step === "string").slice(0, 20).map(step => step.slice(0, 500))
    : ["Analyze objective", "Prepare engineering plan", "Request scoped approval for any tool execution", "Verify outputs"];
  const normalizedTitle = title.slice(0, 120);
  const now = Date.now();
  const id = typeof body.id === "string" && /^[A-Za-z0-9_-]{8,100}$/.test(body.id) ? body.id : randomUUID();
  const safeActions: MissionAction[] = actions.length ? [...new Set(actions)] : ["engineering.plan"];
  const planHash = stableHash({ id, title: normalizedTitle, goal, plan, actions: safeActions });
  return {
    id, title: normalizedTitle, goal, status: "awaiting_approval",
    actions: safeActions, planHash, plan, approvalRequired: true,
    createdAt: now, updatedAt: now
  };
}

export function isAllowedMissionTransition(from: MissionStatus, to: MissionStatus): boolean {
  const transitions: Record<MissionStatus, MissionStatus[]> = {
    planned: ["awaiting_approval", "cancelled"],
    awaiting_approval: ["approved", "cancelled"],
    approved: ["running", "cancelled"],
    running: ["verification_failed", "verified", "failed"],
    verification_failed: ["awaiting_approval", "cancelled"],
    verified: [],
    failed: ["awaiting_approval", "cancelled"],
    cancelled: []
  };
  return transitions[from].includes(to);
}
