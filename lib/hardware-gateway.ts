import { randomUUID } from "node:crypto";

export type GatewayProtocol = "opcua" | "mqtt" | "sparkplug" | "modbus";
export type GatewayOperation = "read" | "write" | "start" | "stop" | "pause" | "reset";

export type GatewayDevice = {
  id: string;
  name: string;
  protocol: GatewayProtocol;
  endpoint: string;
  enabled: boolean;
  simulation: boolean;
};

export type GatewayCommand = {
  deviceId: string;
  operation: GatewayOperation;
  parameter?: string;
  value?: string | number | boolean;
  requestedBy: string;
  approvalId?: string;
  lineClearProof?: string;
};

export type GatewayResult = {
  commandId: string;
  status: "accepted" | "rejected" | "simulated";
  deviceId: string;
  operation: GatewayOperation;
  timestamp: number;
  message: string;
};

const devices = new Map<string, GatewayDevice>();

export function registerGatewayDevice(device: GatewayDevice) {
  if (!/^[A-Za-z0-9._:-]{1,100}$/.test(device.id)) throw new Error("Invalid gateway device ID");
  if (!device.endpoint || device.endpoint.length > 500) throw new Error("Invalid gateway endpoint");
  devices.set(device.id, { ...device });
  return devices.get(device.id)!;
}

export function listGatewayDevices() {
  return [...devices.values()];
}

export function getGatewayDevice(id: string) {
  return devices.get(id);
}

export function validateGatewayCommand(command: GatewayCommand) {
  if (!getGatewayDevice(command.deviceId)) throw new Error("Unknown gateway device");
  if (!command.requestedBy) throw new Error("Requester identity is required");
  if (!["read","write","start","stop","pause","reset"].includes(command.operation)) {
    throw new Error("Unsupported gateway operation");
  }
  if (command.operation === "write" && command.value === undefined) {
    throw new Error("Write operation requires a value");
  }
}

export function executeGatewayCommand(command: GatewayCommand, opts: {
  approvalVerified: boolean;
  lineClearVerified: boolean;
  simulationOnly?: boolean;
}): GatewayResult {
  validateGatewayCommand(command);

  if (!opts.approvalVerified) {
    return { commandId: randomUUID(), status: "rejected", deviceId: command.deviceId, operation: command.operation, timestamp: Date.now(), message: "Explicit gateway approval required." };
  }

  if (!opts.lineClearVerified) {
    return { commandId: randomUUID(), status: "rejected", deviceId: command.deviceId, operation: command.operation, timestamp: Date.now(), message: "Fingerprint Line Clear verification required." };
  }

  const device = getGatewayDevice(command.deviceId)!;

  // Default to simulation until a real, authenticated adapter is installed.
  if (opts.simulationOnly !== false || device.simulation) {
    return { commandId: randomUUID(), status: "simulated", deviceId: device.id, operation: command.operation, timestamp: Date.now(), message: "Command accepted by THARA gateway layer in simulation mode; no physical device was changed." };
  }

  // Real protocol adapters must be installed behind this boundary.
  return { commandId: randomUUID(), status: "rejected", deviceId: device.id, operation: command.operation, timestamp: Date.now(), message: "No physical adapter is installed for this device." };
}

export function hardwareGatewaySummary() {
  return {
    version: "1.0",
    architecture: "THARA -> Secure Gateway -> Protocol Adapter -> Device",
    protocols: ["opcua","mqtt","sparkplug","modbus"] as GatewayProtocol[],
    operations: ["read","write","start","stop","pause","reset"] as GatewayOperation[],
    safety: {
      defaultSimulation: true,
      explicitApproval: true,
      fingerprintLineClear: true,
      physicalExecutionRequiresAdapter: true,
      auditRequired: true
    },
    deviceCount: devices.size
  };
}
