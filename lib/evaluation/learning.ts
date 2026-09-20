export type EvalRecord={task:string;score:number;latencyMs:number;createdAt:number;model?:string;tags?:string[]};

export function aggregateEvaluation(records:EvalRecord[]){
 if(!records.length)return {count:0,averageScore:0,averageLatencyMs:0,passRate:0};
 const pass=records.filter(r=>r.score>=.8).length;
 return {count:records.length,averageScore:records.reduce((a,r)=>a+r.score,0)/records.length,averageLatencyMs:records.reduce((a,r)=>a+r.latencyMs,0)/records.length,passRate:pass/records.length};
}

export function detectRegression(current:EvalRecord[],baseline:EvalRecord[]){
 const a=aggregateEvaluation(current), b=aggregateEvaluation(baseline);
 return {scoreDelta:a.averageScore-b.averageScore,latencyDelta:a.averageLatencyMs-b.averageLatencyMs,regressed:a.averageScore<b.averageScore-.05||a.averageLatencyMs>b.averageLatencyMs*1.2};
}

export function proposeLearningSignal(records:EvalRecord[]){
 const a=aggregateEvaluation(records);
 return {averageScore:a.averageScore,averageLatencyMs:a.averageLatencyMs,passRate:a.passRate,needsReview:a.averageScore<.8||a.passRate<.8};
}
