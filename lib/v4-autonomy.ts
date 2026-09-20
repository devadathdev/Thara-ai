export type MissionStatus="planned"|"awaiting_approval"|"running"|"completed"|"failed"|"cancelled";
export type Mission={id:string;title:string;goal:string;status:MissionStatus;steps:string[];createdAt:number;updatedAt:number;approvalRequired:boolean};
export const DEFAULT_PERMISSIONS=[
 "read:memory","read:datasets","read:knowledge-graph","research:web","write:memory"
] as const;
export function normalizeMission(input:any):Mission{
 const title=String(input?.title||"Untitled mission").trim().slice(0,120);
 const goal=String(input?.goal||"").trim().slice(0,4000);
 const steps=Array.isArray(input?.steps)?input.steps.filter((x:any)=>typeof x==="string").slice(0,20).map((x:string)=>x.slice(0,500)):[];
 return {id:String(input?.id||crypto.randomUUID()),title,goal,status:"planned",steps,createdAt:Date.now(),updatedAt:Date.now(),approvalRequired:true};
}
