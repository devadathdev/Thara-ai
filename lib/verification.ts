import type { ToolRisk } from "@/lib/agent-tools";

export type VerificationResult={allowed:boolean;requiresApproval:boolean;requiresLineClear:boolean;requiresSandbox:boolean;reason?:string};

export function verifyToolAction(risk:ToolRisk, opts:{approved?:boolean;lineClear?:boolean;sandboxed?:boolean}={}):VerificationResult{
 const requiresApproval=risk==="approval"||risk==="protected";
 const requiresLineClear=risk==="protected";
 const requiresSandbox=risk!=="safe";
 if(requiresApproval&&!opts.approved)return {allowed:false,requiresApproval:true,requiresLineClear,requiresSandbox,reason:"Explicit approval required"};
 if(requiresLineClear&&!opts.lineClear)return {allowed:false,requiresApproval:true,requiresLineClear:true,requiresSandbox,reason:"Fingerprint Line Clear verification required"};
 if(requiresSandbox&&!opts.sandboxed)return {allowed:false,requiresApproval,requiresLineClear,requiresSandbox:true,reason:"Sandbox verification required"};
 return {allowed:true,requiresApproval,requiresLineClear,requiresSandbox};
}

export function verifyMissionObjective(objective:string){
 const blocked=/\b(exfiltrate|steal|credential dump|disable security|bypass authentication|destroy production)\b/i;
 if(blocked.test(objective))return {allowed:false,reason:"Objective rejected by safety policy"};
 return {allowed:true};
}
