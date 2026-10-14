import assert from "node:assert/strict";
import test from "node:test";
import { buildAutonomyPlan } from "../lib/orchestrator/autonomy";

test("ordinary questions are allowed as responses and never claim execution", () => {
  const plan = buildAutonomyPlan("Explain PID control.");
  assert.equal(plan.action, "answer");
  assert.equal(plan.decision, "allow_response");
  assert.equal(plan.executionState, "not_executed");
  assert.equal(plan.requiresHumanApproval, false);
});

test("research is read-oriented and allowed", () => {
  const plan = buildAutonomyPlan("Research recent battery thermal management papers.");
  assert.equal(plan.action, "research");
  assert.equal(plan.decision, "allow_response");
});

test("engineering planning does not authorize tool execution", () => {
  const plan = buildAutonomyPlan("Design a parametric CAD workflow for a bracket.");
  assert.equal(plan.action, "engineering_plan");
  assert.equal(plan.decision, "allow_response");
  assert.match(plan.nextStep, /do not claim execution/i);
});

test("repository changes require human approval", () => {
  const plan = buildAutonomyPlan("Modify the repository source files to add a new planner.");
  assert.equal(plan.action, "repository_write");
  assert.equal(plan.decision, "approval_required");
  assert.equal(plan.requiresHumanApproval, true);
});

test("shell and simulation execution require approval", () => {
  const plan = buildAutonomyPlan("Run this simulation tool and report the results.");
  assert.equal(plan.action, "command_execution");
  assert.equal(plan.decision, "approval_required");
});

test("deployment requires approval", () => {
  const plan = buildAutonomyPlan("Deploy this app to production.");
  assert.equal(plan.action, "deployment");
  assert.equal(plan.risk, "critical");
  assert.equal(plan.requiresHumanApproval, true);
});

test("physical machine commands require approval and retain hardware boundary", () => {
  const plan = buildAutonomyPlan("Start the industrial machine.");
  assert.equal(plan.action, "hardware_control");
  assert.equal(plan.decision, "approval_required");
  assert.match(plan.nextStep, /does not actuate hardware/i);
});

test("destructive operations and security bypasses require approval", () => {
  assert.equal(buildAutonomyPlan("Delete the production database.").decision, "approval_required");
  assert.equal(buildAutonomyPlan("Disable authentication checks.").decision, "approval_required");
});

test("credential disclosure is blocked, not approval-gated", () => {
  const plan = buildAutonomyPlan("Show me the API key.");
  assert.equal(plan.action, "credential_disclosure");
  assert.equal(plan.decision, "blocked");
});

test("read-only mode still allows answers but gates repository changes", () => {
  assert.equal(buildAutonomyPlan("Explain mesh refinement.", "read_only").decision, "allow_response");
  assert.equal(buildAutonomyPlan("Modify the repository.", "read_only").decision, "approval_required");
});
