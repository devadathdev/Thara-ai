import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

const BLOCKED=/\b(rm\s+-rf|mkfs|shutdown|reboot|curl\s+[^|]*\|\s*sh|wget\s+[^|]*\|\s*sh|sudo|chmod\s+777|\.env|credentials|private.?key)\b/i;

export async function runSandboxedCommand(command:string, timeoutMs=30_000) {
  if (!command.trim() || command.length>2000 || BLOCKED.test(command)) throw new Error("Command rejected by sandbox policy");
  const dir=await mkdtemp(join(tmpdir(),"thara-sandbox-"));
  try {
    return await new Promise<{code:number;stdout:string;stderr:string}>((resolve,reject)=>{
      const child=spawn("sh",["-lc",command],{cwd:dir,env:{PATH:process.env.PATH||"/usr/bin:/bin",HOME:dir,LANG:"C"},timeout:timeoutMs});
      let stdout="",stderr=""; child.stdout.on("data",d=>stdout+=d); child.stderr.on("data",d=>stderr+=d);
      child.on("error",reject); child.on("close",code=>resolve({code:code??-1,stdout:stdout.slice(0,12000),stderr:stderr.slice(0,12000)}));
    });
  } finally { await rm(dir,{recursive:true,force:true}); }
}
export const sandboxId=()=>randomUUID();