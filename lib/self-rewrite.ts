import fs from "node:fs/promises";
import path from "node:path";

export const SELF_REWRITE_COMMAND = "THARA, REWRITE YOUR OWN CODE";
const MAX_FILE_BYTES = 120_000;
const BACKUP_DIR = ".thara-backups";
const ALLOWED_FILES = new Set(["app/page.tsx","app/globals.css","app/layout.tsx","app/api/assistant/route.ts","lib/assistant.ts","lib/model-router.ts","lib/security-agent.ts","lib/engineering-team.ts"]);

export function isSelfRewriteCommand(message: string) { return message.trim().toUpperCase() === SELF_REWRITE_COMMAND; }
function projectRoot() { return process.cwd(); }

export async function readRewriteableFiles() {
  const root = projectRoot(); const files: Record<string,string> = {};
  for (const relative of ALLOWED_FILES) {
    const absolute=path.join(root,relative);
    try { const stat=await fs.stat(absolute); if(stat.size<=MAX_FILE_BYTES) files[relative]=await fs.readFile(absolute,"utf8"); } catch {}
  }
  return files;
}
function assertAllowed(relative:string) {
  if(!ALLOWED_FILES.has(relative)) throw new Error(`File is not rewriteable: ${relative}`);
  if(relative.includes("..")||path.isAbsolute(relative)) throw new Error("Invalid file path");
}
export async function applySelfRewrite(changes:Record<string,string>,reason:string) {
  const root=projectRoot(); const backupRoot=path.join(root,BACKUP_DIR,new Date().toISOString().replace(/[:.]/g,"-")); await fs.mkdir(backupRoot,{recursive:true});
  const applied:string[]=[];
  try {
    for(const [relative,content] of Object.entries(changes)){ assertAllowed(relative); if(typeof content!=="string"||content.length>MAX_FILE_BYTES) throw new Error(`Invalid rewrite payload for ${relative}`); const absolute=path.join(root,relative); await fs.mkdir(path.dirname(absolute),{recursive:true}); try{await fs.copyFile(absolute,path.join(backupRoot,path.basename(relative)))}catch{} await fs.writeFile(absolute,content,"utf8"); applied.push(relative); }
    await fs.writeFile(path.join(backupRoot,"manifest.json"),JSON.stringify({reason,applied,createdAt:new Date().toISOString()},null,2),"utf8");
    return {applied,backupDir:path.relative(root,backupRoot)};
  } catch(error){ for(const relative of applied.reverse()){try{await fs.copyFile(path.join(backupRoot,path.basename(relative)),path.join(root,relative))}catch{}} throw error; }
}
export function rewriteSystemPrompt(){ return `You are THARA's controlled self-rewrite engine. The user has explicitly authorized the exact command: "${SELF_REWRITE_COMMAND}".
Generate a conservative improvement to THARA's own application source. You may only change the allowlisted files supplied to you. Never request or modify secrets, .env files, package manifests, authentication rules, security policy, deployment configuration, or arbitrary filesystem paths. Preserve existing security controls. Do not add shell execution, remote code execution, credential exfiltration, persistence, or self-replication.
Return ONLY valid JSON in this exact shape:
{"reason":"short reason","changes":{"relative/path.ts":"complete replacement file content"}}
If no safe improvement can be made, return {"reason":"no safe change","changes":{}}.`; }