import {extractKeywords} from "@/lib/knowledge-graph";

export type DatasetDoc={id:string;name:string;source?:string;description?:string;tags?:string[];preview?:{text?:string;contentType?:string};url?:string;license?:string;};

export function retrieveDatasets(datasets:DatasetDoc[],query:string,limit=6){
 const terms=extractKeywords(query);
 return datasets.map(d=>{
  const text=[d.name,d.description,d.source,d.license,...(d.tags||[]),d.preview?.text||""].join(" ").toLowerCase();
  const score=terms.reduce((n,t)=>n+(text.includes(t)?1:0),0);
  return {d,score};
 }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,limit).map(x=>x.d);
}

export function datasetContext(datasets:DatasetDoc[]){
 return datasets.map(d=>[
  `DATASET: ${d.name}`,
  `SOURCE: ${d.source||"unknown"}`,
  `URL: ${d.url||"unknown"}`,
  `LICENSE: ${d.license||"not declared"}`,
  `DESCRIPTION: ${d.description||""}`,
  `TAGS: ${(d.tags||[]).join(", ")}`,
  `PREVIEW: ${(d.preview?.text||"").slice(0,5000)}`
 ].join("\n")).join("\n\n");
}