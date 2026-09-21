import { routeCapability } from "@/lib/thara-v5";

export type ToolRisk = "safe" | "approval" | "protected";
export type TharaTool = { id:string; name:string; description:string; risk:ToolRisk; domains:string[]; run:(input:Record<string,unknown>)=>Promise<Record<string,unknown>> };

const tools = new Map<string, TharaTool>();

export function registerTool(tool: TharaTool) { if (!tool.id || tools.has(tool.id)) throw new Error("Tool already registered"); tools.set(tool.id, tool); }
export function listTools() { return [...tools.values()].map(({run,...metadata}) => metadata); }
export function getTool(id:string) { return tools.get(id); }

registerTool({
 id:"capability-router", name:"Capability Router", description:"Routes a mission into THARA capability domains.", risk:"safe",
 domains:["intelligence","research","engineering","builder"],
 async run(input) {
  const message=typeof input.message==="string"?input.message.trim():"";
  if(!message||message.length>4000) throw new Error("message must be 1–4000 characters");
  return {domains:routeCapability(message),routed:true};
 }
});

registerTool({
 id:"mission-inspector", name:"Mission Inspector", description:"Produces a bounded execution plan without performing consequential actions.", risk:"safe",
 domains:["intelligence"],
 async run(input) {
  const message=typeof input.message==="string"?input.message.trim():"";
  if(!message||message.length>4000) throw new Error("message must be 1–4000 characters");
  return {objective:message,steps:["interpret objective","select capabilities","check permissions","verify proposed action","execute only approved tools","record result"]};
 }
});
