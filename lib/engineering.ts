export type EngineeringToolCategory =
  | "cad"
  | "cae"
  | "manufacturing"
  | "industry4";

export type EngineeringTool = {
  id: string;
  name: string;
  category: EngineeringToolCategory;
  type: "open-source" | "protocol" | "workflow" | "platform";
  description: string;
  capabilities: string[];
  integration: "adapter-ready" | "workflow-ready" | "planned";
};

export const ENGINEERING_TOOLS: EngineeringTool[] = [
  { id:"freecad", name:"FreeCAD", category:"cad", type:"open-source", description:"Parametric mechanical CAD and engineering model workflow.", capabilities:["parametric-modeling","assemblies","drawings","BOM","STEP","IGES","STL"], integration:"adapter-ready" },
  { id:"openscad", name:"OpenSCAD", category:"cad", type:"open-source", description:"Scriptable solid modeling for reproducible parametric parts.", capabilities:["parametric-modeling","generative-cad","STL","automation"], integration:"adapter-ready" },
  { id:"gmsh", name:"Gmsh", category:"cae", type:"open-source", description:"Geometry and finite-element mesh generation workflow.", capabilities:["geometry","meshing","2D-mesh","3D-mesh","FEM-preprocessing"], integration:"adapter-ready" },
  { id:"openfoam", name:"OpenFOAM", category:"cae", type:"open-source", description:"Computational fluid dynamics workflow for engineering simulation.", capabilities:["CFD","fluid-flow","heat-transfer","turbulence","parametric-studies"], integration:"workflow-ready" },
  { id:"calculix", name:"CalculiX", category:"cae", type:"open-source", description:"Finite-element structural and thermal analysis workflow.", capabilities:["FEA","structural-analysis","thermal-analysis","stress","deformation"], integration:"workflow-ready" },
  { id:"openmodelica", name:"OpenModelica", category:"cae", type:"open-source", description:"Multi-domain physical-system and control-system simulation.", capabilities:["system-modeling","controls","mechanical","electrical","thermal"], integration:"workflow-ready" },
  { id:"kicad", name:"KiCad", category:"manufacturing", type:"open-source", description:"Electronics design and PCB manufacturing preparation.", capabilities:["schematic","PCB","BOM","Gerber","DRC"], integration:"adapter-ready" },
  { id:"freecad-path", name:"FreeCAD Path", category:"manufacturing", type:"open-source", description:"CAM planning for machining workflows from CAD geometry.", capabilities:["toolpaths","CNC","CAM","post-processing"], integration:"adapter-ready" },
  { id:"opcua", name:"OPC UA", category:"industry4", type:"protocol", description:"Industrial interoperability layer for secure machine and plant data exchange.", capabilities:["machine-data","interoperability","asset-models","telemetry"], integration:"adapter-ready" },
  { id:"mqtt-sparkplug", name:"MQTT + Sparkplug", category:"industry4", type:"protocol", description:"Lightweight industrial event and telemetry messaging architecture.", capabilities:["telemetry","events","edge-to-cloud","device-state"], integration:"adapter-ready" },
  { id:"modbus", name:"Modbus", category:"industry4", type:"protocol", description:"Industrial device communication adapter boundary.", capabilities:["PLC-data","registers","sensors","actuators"], integration:"adapter-ready" },
  { id:"digital-twin", name:"Digital Twin", category:"industry4", type:"workflow", description:"Connects asset models, simulation, telemetry and lifecycle state.", capabilities:["asset-model","simulation-link","telemetry","lifecycle"], integration:"workflow-ready" },
  { id:"mes", name:"MES Integration", category:"industry4", type:"workflow", description:"Manufacturing execution workflow for production, quality and traceability data.", capabilities:["production-orders","traceability","quality","work-in-progress"], integration:"planned" },
  { id:"oee", name:"OEE Analytics", category:"industry4", type:"workflow", description:"Overall equipment effectiveness analytics from availability, performance and quality signals.", capabilities:["availability","performance","quality","downtime"], integration:"workflow-ready" },
  { id:"predictive-maintenance", name:"Predictive Maintenance", category:"industry4", type:"workflow", description:"Condition-monitoring and failure-risk workflow using equipment telemetry.", capabilities:["condition-monitoring","anomaly-detection","remaining-useful-life","maintenance-planning"], integration:"workflow-ready" }
];

export const ENGINEERING_WORKFLOWS = [
  "requirements-to-cad",
  "cad-to-cae",
  "cad-to-cam",
  "simulation-optimization",
  "design-for-manufacturing",
  "design-for-assembly",
  "bom-and-cost-estimation",
  "cnc-process-planning",
  "quality-and-inspection",
  "digital-twin",
  "oee-monitoring",
  "predictive-maintenance",
  "factory-telemetry",
  "production-traceability"
] as const;

export function engineeringToolSummary() {
  return ENGINEERING_TOOLS.reduce<Record<string, number>>((summary, tool) => {
    summary[tool.category] = (summary[tool.category] ?? 0) + 1;
    return summary;
  }, {});
}

export function routeEngineering(message: string) {
  const m = message.toLowerCase();
  const categories = new Set<EngineeringToolCategory>();
  if (/\b(cad|3d model|solid model|parametric|drawing|assembly|step|iges|stl)\b/.test(m)) categories.add("cad");
  if (/\b(cae|fea|fem|cfd|simulation|stress|thermal|fluid|mesh|openfoam|calculix)\b/.test(m)) categories.add("cae");
  if (/\b(manufactur|cam|cnc|machining|toolpath|bom|pcb|gerber|production|quality|inspection)\b/.test(m)) categories.add("manufacturing");
  if (/\b(industry ?4\.0|iiot|opc ?ua|mqtt|sparkplug|modbus|plc|scada|mes|digital twin|oee|predictive maintenance|factory|telemetry)\b/.test(m)) categories.add("industry4");
  return [...categories];
}
