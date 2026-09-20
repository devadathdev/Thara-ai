export type BenchmarkCase={id:string;input:string;expected?:string;tags?:string[]};
export type BenchmarkResult={id:string;ok:boolean;latencyMs:number;error?:string};
export async function runBenchmark(cases:BenchmarkCase[],runner:(input:string)=>Promise<string>):Promise<BenchmarkResult[]>{
 const results:BenchmarkResult[]=[];
 for(const c of cases){const t=performance.now();try{const out=await runner(c.input);results.push({id:c.id,ok:c.expected?out.includes(c.expected):true,latencyMs:Math.round(performance.now()-t)})}catch(e){results.push({id:c.id,ok:false,latencyMs:Math.round(performance.now()-t),error:String(e)})}}
 return results;
}
export function summarizeBenchmark(results:BenchmarkResult[]){
 if(!results.length)return {count:0,passRate:0,averageLatencyMs:0,failures:[]};
 return {count:results.length,passRate:results.filter(r=>r.ok).length/results.length,averageLatencyMs:results.reduce((a,r)=>a+r.latencyMs,0)/results.length,failures:results.filter(r=>!r.ok).map(r=>r.id)};
}
