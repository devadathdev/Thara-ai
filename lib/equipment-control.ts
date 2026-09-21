export type EquipmentProtocol = "OPC-UA" | "MQTT" | "Sparkplug" | "Modbus";
export type EquipmentAction = "read" | "start" | "stop" | "pause" | "reset" | "setpoint";

export type EquipmentCommand = {
  equipmentId: string;
  protocol: EquipmentProtocol;
  action: EquipmentAction;
  parameter?: string;
  value?: number;
  requestedAt: number;
  approvalRequired: true;
};

const allowedActions = new Set<EquipmentAction>(["read","start","stop","pause","reset","setpoint"]);

export function validateEquipmentCommand(input: Partial<EquipmentCommand>) {
  if (!input.equipmentId || !/^[A-Za-z0-9._:-]{1,100}$/.test(input.equipmentId)) throw new Error("Invalid equipment ID");
  if (!input.protocol || !["OPC-UA","MQTT","Sparkplug","Modbus"].includes(input.protocol)) throw new Error("Unsupported equipment protocol");
  if (!input.action || !allowedActions.has(input.action)) throw new Error("Unsupported equipment action");
  if (input.action === "setpoint" && (!input.parameter || typeof input.value !== "number" || !Number.isFinite(input.value))) throw new Error("Setpoint requires parameter and numeric value");
  return {
    equipmentId: input.equipmentId,
    protocol: input.protocol,
    action: input.action,
    parameter: input.parameter,
    value: input.value,
    requestedAt: Date.now(),
    approvalRequired: true as const
  };
}

export function equipmentControlCapabilities() {
  return {
    protocols: ["OPC-UA","MQTT","Sparkplug","Modbus"] as EquipmentProtocol[],
    actions: ["read","start","stop","pause","reset","setpoint"] as EquipmentAction[],
    safety: {
      explicitApproval: true,
      emergencyStop: false,
      directMachineExecution: false,
      productionWrite: false,
      auditRequired: true
    }
  };
}
