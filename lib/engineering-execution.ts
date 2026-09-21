import { runSandboxedCommand, stageFile } from "@/lib/autonomous/sandbox";
import { normalizeEngineeringResult, type EngineeringResult } from "@/lib/engineering-results";

export type SupportedEngine = "openscad" | "freecad" | "openfoam" | "calculix";

const versionCommands:Record<SupportedEngine,string> = {
  openscad:"openscad --version",
  freecad:"freecadcmd --version",
  openfoam:"foamVersion",
  calculix:"ccx -v"
};

export async function probeEngine(engine:SupportedEngine) {
  return runSandboxedCommand(versionCommands[engine],5000);
}

export async function executePreparedEngineeringCommand(
  engine:SupportedEngine,
  filename:string,
  content:string,
  command:string,
  timeoutMs=30000
):Promise<EngineeringResult> {
  if(!/^[A-Za-z0-9._-]+$/.test(filename)) throw new Error("Invalid staged filename");
  if(!command.trim() || command.length>1500) throw new Error("Invalid engineering command");
  const staged=await stageFile(filename,content);
  const safeCommand=`cd ${JSON.stringify(staged.dir)} && ${command}`;
  const result=await runSandboxedCommand(safeCommand,Math.min(Math.max(timeoutMs,1000),120000));
  return normalizeEngineeringResult(engine,result);
}
