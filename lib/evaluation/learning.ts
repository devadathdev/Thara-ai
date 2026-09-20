export type EvalRecord={task:string;score:number;latencyMs:number;createdAt:number;model?:string};
export function aggregateEvaluation(records:EvalRecord[]){
 if(!records.length)return {count:0,averageScore:0,averageLatencyMs:0};
 return {count:records.length,averageScore:records.reduce((a,r)=>a+r.score,0)/records.length,averageLatencyMs:records.reduce((a,r)=>a+r.latencyMs,0)/records.length};
}
export function proposeLearningSignal(records:EvalRecord[]){
 const a=aggregateEvaluation(records);
 return {averageScore:a.averageScore,averageLatencyMs:a.averageLatencyMs,needsReview:a.averageScore<.8};
}