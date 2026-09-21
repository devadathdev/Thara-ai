export type EngineeringResult = {
  tool: string;
  status: "completed" | "failed" | "not-installed";
  exitCode: number;
  durationMs: number;
  stdout: string;
  stderr: string;
  metrics: Record<string, number | string>;
};

const numberMetric = /\b([A-Za-z][A-Za-z _-]{1,30})\s*[:=]\s*(-?\d+(?:\.\d+)?)\s*(%|Pa|MPa|mm|K|m\/s)?\b/g;

export function normalizeEngineeringResult(tool:string, result:{code:number;stdout:string;stderr:string;durationMs:number}):EngineeringResult {
  const metrics:Record<string,number|string>={};
  for(const match of result.stdout.matchAll(numberMetric)){
    const key=match[1].trim().toLowerCase().replace(/\s+/g,"_");
    metrics[key]=match[3] ? `${match[2]}${match[3]}` : Number(match[2]);
  }
  return {
    tool,
    status:result.code===0?"completed":"failed",
    exitCode:result.code,
    durationMs:result.durationMs,
    stdout:result.stdout.slice(0,12000),
    stderr:result.stderr.slice(0,12000),
    metrics
  };
}
