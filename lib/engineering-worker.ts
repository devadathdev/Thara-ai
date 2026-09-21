import { runSandboxedCommand, stageFile } from "@/lib/autonomous/sandbox";
import { generateEngineeringArtifact, type EngineeringArtifactKind } from "@/lib/engineering-generators";

export type EngineeringRun = {
  tool: "openscad" | "freecad" | "openfoam" | "calculix";
  status: "prepared" | "rejected";
  artifact?: { filename:string; content:string; kind:EngineeringArtifactKind };
  execution: { attempted:boolean; allowed:boolean; reason:string };
};

const commands: Record<EngineeringRun["tool"], string> = {
  openscad: "openscad --version",
  freecad: "freecadcmd --version",
  openfoam: "foamVersion",
  calculix: "ccx -v"
};

export async function prepareEngineeringRun(tool: EngineeringRun["tool"], input: Record<string, unknown>): Promise<EngineeringRun> {
  const kind: EngineeringArtifactKind = tool === "openscad" ? "openscad" : tool === "freecad" ? "freecad-python" : tool === "openfoam" ? "openfoam-case" : "openfoam-case";
  const artifact = generateEngineeringArtifact(kind, input);
  await stageFile(artifact.filename, artifact.content);
  const probe = await runSandboxedCommand(commands[tool], 5000).catch(() => null);
  return {
    tool,
    status: "prepared",
    artifact: { filename: artifact.filename, content: artifact.content, kind },
    execution: {
      attempted: Boolean(probe),
      allowed: false,
      reason: "Tool availability may be probed, but engineering simulation and machine execution require explicit approval and a dedicated isolated worker."
    }
  };
}
