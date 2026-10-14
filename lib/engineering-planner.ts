import { ENGINEERING_TOOLS, type EngineeringToolCategory, routeEngineering } from "@/lib/engineering";

export type EngineeringMission = {
  title: string;
  categories: EngineeringToolCategory[];
  stages: string[];
  tools: string[];
  approvalRequired: boolean;
};

const stageMap: Record<EngineeringToolCategory, string[]> = {
  cad: ["requirements", "parametric CAD", "assembly/drawing review", "export"],
  cae: ["geometry cleanup", "mesh", "simulation", "results validation"],
  manufacturing: ["DFM review", "process planning", "CAM/toolpath", "quality inspection"],
  industry4: ["asset model", "connectivity", "telemetry", "analytics/digital twin"]
};

export function planEngineeringMission(message: string): EngineeringMission {
  const categories = routeEngineering(message);
  const selected: EngineeringToolCategory[] = categories.length ? categories : ["cad"];
  const stages = [...new Set(selected.flatMap(c => stageMap[c]))];
  const tools = ENGINEERING_TOOLS.filter(t => selected.includes(t.category)).map(t => t.name);
  return {
    title: message.trim().slice(0, 100),
    categories: selected,
    stages,
    tools,
    approvalRequired: true
  };
}
