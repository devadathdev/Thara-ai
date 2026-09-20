export type DatasetSource = "huggingface"|"kaggle"|"uci"|"github"|"government"|"custom";

export type DatasetRecord = {
  id:string; name:string; source:DatasetSource; url:string; description:string;
  license?:string; tags:string[]; size?:string; status:"discovered"|"approved"|"indexed";
};

export const DATASET_SOURCES = [
  {id:"huggingface",name:"Hugging Face Datasets",base:"https://huggingface.co/datasets"},
  {id:"kaggle",name:"Kaggle Datasets",base:"https://www.kaggle.com/datasets"},
  {id:"uci",name:"UCI Machine Learning Repository",base:"https://archive.ics.uci.edu/"},
  {id:"github",name:"GitHub public repositories",base:"https://github.com/"},
  {id:"government",name:"Open Government Data",base:"https://data.gov/"},
  {id:"custom",name:"Custom uploads",base:"local://thara"},
] as const;

export function normalizeDataset(input:any):DatasetRecord {
  const source=DATASET_SOURCES.some(x=>x.id===input?.source)?input.source:"custom";
  return {
    id:String(input?.id||crypto.randomUUID()),
    name:String(input?.name||"Unnamed dataset").slice(0,200),
    source, url:String(input?.url||"").slice(0,2048),
    description:String(input?.description||"").slice(0,2000),
    license:input?.license?String(input.license).slice(0,200):undefined,
    tags:Array.isArray(input?.tags)?input.tags.filter((x:any)=>typeof x==="string").slice(0,30):[],
    size:input?.size?String(input.size).slice(0,100):undefined,
    status:"discovered"
  };
}

export function datasetAllowedForIndexing(dataset:DatasetRecord) {
  if(!dataset.url) return false;
  if(dataset.license && /no.?redistribution|all rights reserved/i.test(dataset.license)) return false;
  return /^https?:\/\//i.test(dataset.url);
}
