import assert from "node:assert/strict";
import test from "node:test";
import { issueApprovalToken, verifyApprovalToken } from "../lib/orchestrator/approval";

const input = { uid: "user-123", missionId: "mission_1234", planHash: "a".repeat(64), actions: ["engineering.plan"] as ("engineering.plan" | "artifact.sha256")[] };

test("approval token is scoped to user, mission, plan and action", () => {
  process.env.THARA_APPROVAL_SECRET = "test-secret-that-is-at-least-32-characters-long";
  const issued = issueApprovalToken(input);
  const claims = verifyApprovalToken(issued.token, { uid: input.uid, missionId: input.missionId, planHash: input.planHash, action: "engineering.plan" });
  assert.equal(claims.jti, issued.claims.jti);
  assert.equal(issued.expiresAt > Date.now(), true);
});

test("approval token cannot be reused for a different user or plan", () => {
  process.env.THARA_APPROVAL_SECRET = "test-secret-that-is-at-least-32-characters-long";
  const issued = issueApprovalToken(input);
  assert.throws(() => verifyApprovalToken(issued.token, { uid: "another-user", missionId: input.missionId, planHash: input.planHash, action: "engineering.plan" }), /scope/);
  assert.throws(() => verifyApprovalToken(issued.token, { uid: input.uid, missionId: input.missionId, planHash: "b".repeat(64), action: "engineering.plan" }), /scope/);
});

test("approval token cannot authorize an unapproved action", () => {
  process.env.THARA_APPROVAL_SECRET = "test-secret-that-is-at-least-32-characters-long";
  const issued = issueApprovalToken(input);
  assert.throws(() => verifyApprovalToken(issued.token, { uid: input.uid, missionId: input.missionId, planHash: input.planHash, action: "artifact.sha256" }), /does not include/);
});

test("approval tokens require a strong server-side secret", () => {
  process.env.THARA_APPROVAL_SECRET = "short";
  assert.throws(() => issueApprovalToken(input), /at least 32 characters/);
});
