export type AutonomyMode = "guarded" | "read_only";
export type AutonomyAction =
  | "answer"
  | "research"
  | "engineering_plan"
  | "repository_write"
  | "command_execution"
  | "deployment"
  | "hardware_control"
  | "destructive_operation"
  | "credential_disclosure";
export type AutonomyDecision = "allow_response" | "approval_required" | "blocked";

export type AutonomyPlan = {
  policyVersion: "v1";
  mode: AutonomyMode;
  action: AutonomyAction;
  decision: AutonomyDecision;
  risk: "low" | "medium" | "high" | "critical";
  requiresHumanApproval: boolean;
  executionState: "not_executed";
  reason: string;
  nextStep: string;
};

function configuredMode(): AutonomyMode {
  return process.env.THARA_AUTONOMY_MODE === "read_only" ? "read_only" : "guarded";
}

function classifyAction(message: string): AutonomyAction {
  const text = message.toLowerCase();

  // Only classify an actual request to expose a credential, not discussion about
  // credential safety or how to configure secrets correctly.
  if (
    /\b(show|reveal|print|dump|exfiltrate|send|return|give me|display)\b.{0,70}\b(api key|access token|refresh token|password|private key|secret key|\.env|credentials?)\b/.test(text) ||
    /\b(read|open|cat|copy)\b.{0,30}\.env\b/.test(text)
  ) return "credential_disclosure";

  if (
    /\b(start|stop|reset|move|operate|control|actuate|energize|write to|send (?:a )?command to)\b.{0,80}\b(robot|plc|machine|motor|actuator|hardware|industrial device|factory equipment|gateway)\b/.test(text) ||
    /\b(robot|plc|motor|actuator|industrial machine|factory equipment)\b.{0,80}\b(start|stop|reset|move|operate|control|actuate|energize)\b/.test(text)
  ) return "hardware_control";

  if (/\b(deploy|publish|release to production|promote to production|push to production|ship to production)\b/.test(text)) {
    return "deployment";
  }

  if (
    /\b(delete|wipe|erase|drop|truncate|destroy|overwrite|purge)\b.{0,80}\b(database|production data|user data|records?|repository|repo|branch|files?|project|account|storage|disk)\b/.test(text) ||
    /\b(disable|bypass|remove)\b.{0,60}\b(authentication|authorization|approval|security checks?|safety interlocks?)\b/.test(text)
  ) return "destructive_operation";

  if (
    /\b(commit|push|merge|edit|modify|rewrite|patch|refactor|change|update)\b.{0,100}\b(repository|repo|codebase|source files?|project files?|branch|pull request|\bpr\b)\b/.test(text) ||
    /\b(repository|repo|codebase|source files?|project files?|branch|pull request|\bpr\b)\b.{0,100}\b(commit|push|merge|edit|modify|rewrite|patch|refactor|change|update)\b/.test(text)
  ) return "repository_write";

  if (
    /\b(execute|run|launch|install|uninstall|invoke)\b.{0,80}\b(command|script|shell|terminal|powershell|bash|program|simulation|tool)\b/.test(text) ||
    /\b(rm\s+-rf|sudo\s+|format\s+(?:the\s+)?disk|run this command|execute this script)\b/.test(text)
  ) return "command_execution";

  if (/\b(research|investigate|browse|look up|search the web|find and verify|compare sources|latest news)\b/.test(text)) {
    return "research";
  }

  if (/\b(design|engineer|cad|fea|fem|cfd|simulation plan|digital twin|schematic|mechanical design|engineering workflow)\b/.test(text)) {
    return "engineering_plan";
  }

  return "answer";
}

export function buildAutonomyPlan(message: string, mode: AutonomyMode = configuredMode()): AutonomyPlan {
  const action = classifyAction(typeof message === "string" ? message.trim() : "");
  if (action === "credential_disclosure") {
    return {
      policyVersion: "v1",
      mode,
      action,
      decision: "blocked",
      risk: "critical",
      requiresHumanApproval: false,
      executionState: "not_executed",
      reason: "Requests to reveal or export credentials are blocked. THARA must not expose secrets.",
      nextStep: "Use the secret manager or provider console to rotate or configure credentials without displaying their values."
    };
  }

  const riskByAction: Record<AutonomyAction, AutonomyPlan["risk"]> = {
    answer: "low",
    research: "low",
    engineering_plan: "medium",
    repository_write: "high",
    command_execution: "high",
    deployment: "critical",
    hardware_control: "critical",
    destructive_operation: "critical",
    credential_disclosure: "critical"
  };

  const approvalByAction: AutonomyAction[] = [
    "repository_write",
    "command_execution",
    "deployment",
    "hardware_control",
    "destructive_operation"
  ];
  const needsApproval = approvalByAction.includes(action) ||
    (mode === "read_only" && action !== "answer" && action !== "research" && action !== "engineering_plan");

  const reasons: Record<AutonomyAction, string> = {
    answer: "This request can be handled as a response without changing external state.",
    research: "Read-oriented research may proceed; source content remains untrusted and must be checked.",
    engineering_plan: "Engineering analysis and planning may proceed, but this decision does not authorize running tools or changing files.",
    repository_write: "Repository mutations require an explicit human approval step before any write is attempted.",
    command_execution: "Running commands, scripts, simulations, or installed tools requires explicit approval and a bounded execution environment.",
    deployment: "Publishing or production deployment is a high-impact action and requires explicit approval plus verification.",
    hardware_control: "Physical-world commands require operator approval and local gateway safety checks; this API does not actuate hardware.",
    destructive_operation: "Destructive changes or attempts to bypass safeguards are not autonomous actions; explicit human review is required.",
    credential_disclosure: "Credential disclosure is blocked."
  };

  const nextSteps: Record<AutonomyAction, string> = {
    answer: "Respond normally. Do not imply that an external action occurred.",
    research: "Gather and assess sources, then report what was verified and what remains uncertain.",
    engineering_plan: "Return a staged plan with assumptions, validation criteria, and required tools; do not claim execution.",
    repository_write: "Prepare a proposed diff and validation plan. Wait for explicit approval before writing repository files.",
    command_execution: "Show the exact command, expected effects, sandbox boundary, and rollback plan; wait for approval.",
    deployment: "Prepare a deployment plan, checks, rollback strategy, and target environment; wait for approval.",
    hardware_control: "Keep the operation in simulation/planning until an authenticated local gateway, operator approval, and safety checks are confirmed.",
    destructive_operation: "Explain the impact and safer alternative; do not perform the destructive action.",
    credential_disclosure: "Do not display credentials; use a secret manager or rotation workflow."
  };

  return {
    policyVersion: "v1",
    mode,
    action,
    decision: needsApproval ? "approval_required" : "allow_response",
    risk: riskByAction[action],
    requiresHumanApproval: needsApproval,
    executionState: "not_executed",
    reason: reasons[action],
    nextStep: nextSteps[action]
  };
}
