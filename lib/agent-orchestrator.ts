import { getTool, listTools, type ToolRisk } from "@/lib/agent-tools";

export type MissionStep={id:string;toolId:string;input:Record<string,unknown>;risk:ToolRisk;status:"planned"|"blocked"|"completed"|"failed";output?:Record<string,unknown>;error?:string};
export type MissionPlan={id:string;objective:string;steps:MissionStep[];requiresApproval:boolean;status:"planned"|"completed"|"partially-completed"};

function missionId(){return `mission-${Date.now()}-${Math.random().toString(36).slice(2,8)}`}

export function planMission(objective:string):MissionPlan{
 const text=objective.trim(); if(!text||text.length>4000) throw new Error("Objective must be 1–4000 characters");
 const router=getTool("capability-router"), inspector=getTool("mission-inspector");
 if(!router||!inspector) throw new Error("Core orchestration tools are unavailable");
 return {id:missionId(),objective:text,steps:[
  {id:"route",toolId:router.id,input:{message:text},risk:router.risk,status:"planned"},
  {id:"inspect",toolId:inspector.id,input:{message:text},risk:inspector.risk,status:"planned"}],
  requiresApproval:false,status:"planned"};
}

export async function executeMission(plan:MissionPlan){
 const steps=[...plan.steps];
 for(const step of steps){
  const tool=getTool(step.toolId);
  if(!tool){step.status="failed";step.error="Tool unavailable";continue}
  if(tool.risk!=="safe"){step.status="blocked";step.error="Approval/protected execution is required for this tool";plan.requiresApproval=true;continue}
  try{step.output=await tool.run(step.input);step.status="completed"}
  catch(error){step.status="failed";step.error=error instanceof Error?error.message:"Tool execution failed"}
 }
 plan.steps=steps;plan.status=steps.some(s=>s.status==="failed")?"partially-completed":"completed";return plan;
}

export function orchestratorSummary(){const tools=listTools();return {toolCount:tools.length,safeTools:tools.filter(t=>t.risk==="safe").length,approvalTools:tools.filter(t=>t.risk==="approval").length,protectedTools:tools.filter(t=>t.risk==="protected").length,executionModel:"plan → permission → execute → observe"}}
