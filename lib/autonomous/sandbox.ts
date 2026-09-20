import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

const BLOCKED=/\b(rm\s+-rf|mkfs|shutdown|reboot|curl\s+[^|]*\|\s*sh|wget\s+[^|]*\|\s*sh|sudo|chmod\s+777|\.env|credentials|private.?key|id_rsa)\b/i;

export type SandboxResult={id:string;code:number;stdout:string;stderr:string;durationMs:number};

export async function runSandboxedCommand(command:string,timeoutMs=30_000):Promise<SandboxResult>{
 if(!command.trim()||command.length>2000||BLOCKED.test(command))throw new Error("Command rejected by sandbox policy");
 const id=randomUUID(),dir=await mkdtemp(join(tmpdir(),"thara-sandbox-")),started=Date.now();
 try{
  return await new Promise((resolve,reject)=>{
   const child=spawn("sh",["-lc",command],{cwd:dir,env:{PATH:process.env.PATH||"/usr/bin:/bin",HOME:dir,LANG:"C",TMPDIR:dir},timeout:timeoutMs});
   let stdout="",stderr=""; child.stdout.on("data",d=>stdout+=d); child.stderr.on("data",d=>stderr+=d);
   child.on("error",reject); child.on("close",code=>resolve({id,code:code??-1,stdout:stdout.slice(0,12000),stderr:stderr.slice(0,12000),durationMs:Date.now()-started}));
  });
 }finally{await rm(dir,{recursive:true,force:true})}
}

export async function stageFile(name:string,content:string){
 if(!/^[a-zA-Z0-9._-]+$/.test(name)||name.startsWith(".env"))throw new Error("File rejected by sandbox policy");
 const dir=await mkdtemp(join(tmpdir(),"thara-stage-"));
 const path=join(dir,name); await writeFile(path,content,{encoding:"utf8"}); return {dir,path,id:randomUUID()};
}
