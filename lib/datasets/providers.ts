export type DatasetProvider="huggingface"|"kaggle"|"uci"|"github"|"government";

export type DatasetHit={id:string;name:string;provider:DatasetProvider;url:string;description:string;license?:string;tags:string[];metadata?:Record<string,unknown>};

const safeText=(v:unknown,n=2000)=>String(v??"").slice(0,n);

export async function searchHuggingFace(q:string):Promise<DatasetHit[]>{
 const headers:HeadersInit={}; if(process.env.HUGGINGFACE_API_TOKEN) headers.Authorization="Bearer "+process.env.HUGGINGFACE_API_TOKEN;
 const r=await fetch("https://huggingface.co/api/datasets?search="+encodeURIComponent(q)+"&limit=20",{headers,signal:AbortSignal.timeout(10000)});
 if(!r.ok) throw new Error("Hugging Face search failed");
 const data=await r.json();
 return (Array.isArray(data)?data:[]).map((d:any)=>({id:String(d.id),name:String(d.id),provider:"huggingface",url:"https://huggingface.co/datasets/"+d.id,description:safeText(d.description),license:safeText(d.cardData?.license||d.license,200),tags:Array.isArray(d.tags)?d.tags.slice(0,30):[],metadata:{downloads:d.downloads,likes:d.likes}}));
}

export async function searchGitHub(q:string):Promise<DatasetHit[]>{
 const r=await fetch("https://api.github.com/search/repositories?q="+encodeURIComponent(q+" dataset")+"&per_page=10",{headers:{"Accept":"application/vnd.github+json","User-Agent":"THARA-Dataset-Hub"},signal:AbortSignal.timeout(10000)});
 if(!r.ok) throw new Error("GitHub search failed");
 const data=await r.json();
 return (Array.isArray(data.items)?data.items:[]).map((d:any)=>({id:String(d.full_name),name:String(d.full_name),provider:"github",url:String(d.html_url),description:safeText(d.description),tags:["github","dataset"],metadata:{stars:d.stargazers_count,updated:d.updated_at}}));
}

export function directoryProviders(q:string):DatasetHit[]{
 const x=q.toLowerCase();
 const hits:DatasetHit[]=[];
 if(/uci|machine learning|classification|regression|iris|heart/.test(x))hits.push({id:"uci-search",name:"UCI Machine Learning Repository",provider:"uci",url:"https://archive.ics.uci.edu/",description:"Public machine-learning dataset repository. Search and select a dataset before ingestion.",tags:["machine-learning","uci"]});
 if(/government|india|kerala|census|agriculture|health|climate|open data/.test(x))hits.push({id:"open-data",name:"Open Government Data",provider:"government",url:"https://data.gov/",description:"Government open-data discovery source. Verify jurisdiction, provenance and license before ingestion.",tags:["open-data","government"]});
 return hits;
}
