export type ToolRisk = "read" | "write" | "control";
export type ToolContext = { uid: string; approved: boolean; traceId: string };
export type ToolDefinition<TInput = unknown, TOutput = unknown> = {
  id: string;
  name: string;
  description: string;
  risk: ToolRisk;
  input: (value: unknown) => value is TInput;
  execute: (input: TInput, context: ToolContext) => Promise<TOutput>;
};

const tools = new Map<string, ToolDefinition<any, any>>();

export function registerTool<TInput, TOutput>(tool: ToolDefinition<TInput, TOutput>) {
  if (tools.has(tool.id)) throw new Error(`Tool already registered: ${tool.id}`);
  tools.set(tool.id, tool);
  return tool;
}

export function getTool(id: string) {
  return tools.get(id);
}

export function listTools() {
  return [...tools.values()].map(({ execute, input, ...publicTool }) => publicTool);
}

export function assertToolInput<T>(tool: ToolDefinition<T>, input: unknown): asserts input is T {
  if (!tool.input(input)) throw new Error(`Invalid input for tool ${tool.id}`);
}

registerTool({
  id: "thara.capability_route",
  name: "Capability Router",
  description: "Routes a mission to THARA capability domains without executing external side effects.",
  risk: "read",
  input: (value): value is { message: string } =>
    !!value && typeof value === "object" && typeof (value as any).message === "string" && (value as any).message.length <= 4000,
  execute: async ({ message }) => {
    const { routeCapability } = await import("@/lib/thara-v5");
    return { domains: routeCapability(message), message };
  },
});
