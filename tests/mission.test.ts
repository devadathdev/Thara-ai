import assert from "node:assert/strict";
import test from "node:test";
import { createMissionRecord, isAllowedMissionTransition, stableHash } from "../lib/orchestrator/mission";

test("mission records start awaiting approval and include an immutable plan hash", () => {
  const mission = createMissionRecord({ title: "CAD bracket", goal: "Plan a bracket workflow" });
  assert.equal(mission.status, "awaiting_approval");
  assert.equal(mission.approvalRequired, true);
  assert.match(mission.planHash, /^[a-f0-9]{64}$/);
  assert.deepEqual(mission.actions, ["engineering.plan"]);
});

test("mission accepts only registered action identifiers", () => {
  const mission = createMissionRecord({ goal: "test", actions: ["engineering.plan", "shell.exec", "deployment"] });
  assert.deepEqual(mission.actions, ["engineering.plan"]);
});

test("mission goal is bounded and plan has a deterministic hash", () => {
  const mission = createMissionRecord({ goal: "x".repeat(5000), steps: ["A", "B"] });
  assert.equal(mission.goal.length, 4000);
  assert.equal(mission.plan.length, 2);
  assert.equal(stableHash({ a: 1 }), stableHash({ a: 1 }));
});

test("valid state transitions require explicit lifecycle progression", () => {
  assert.equal(isAllowedMissionTransition("awaiting_approval", "approved"), true);
  assert.equal(isAllowedMissionTransition("approved", "running"), true);
  assert.equal(isAllowedMissionTransition("running", "verified"), true);
  assert.equal(isAllowedMissionTransition("awaiting_approval", "verified"), false);
  assert.equal(isAllowedMissionTransition("verified", "running"), false);
});
