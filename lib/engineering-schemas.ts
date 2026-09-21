export type CadModelSpec = {
  name: string;
  units: "mm" | "inch";
  parameters: Record<string, number>;
  format: "STEP" | "IGES" | "STL" | "FCStd" | "SCAD";
};

export type SimulationSpec = {
  solver: "FEA" | "CFD" | "thermal" | "multibody";
  mesh: { targetSize: number; qualityTarget?: number };
  materials: string[];
  boundaryConditions: string[];
  outputs: string[];
};

export type ManufacturingSpec = {
  process: "CNC" | "3D-print" | "sheet-metal" | "PCB";
  material: string;
  machine?: string;
  tolerance?: string;
  inspection: string[];
};

export type Industry4Asset = {
  assetId: string;
  name: string;
  protocols: ("OPC-UA" | "MQTT" | "Sparkplug" | "Modbus")[];
  telemetry: string[];
  kpis: ("OEE" | "availability" | "performance" | "quality" | "energy")[];
};

export const ENGINEERING_OUTPUTS = [
  "requirements",
  "CAD parameter specification",
  "simulation specification",
  "manufacturing plan",
  "quality plan",
  "telemetry schema",
  "digital-twin asset model",
  "engineering report"
] as const;
