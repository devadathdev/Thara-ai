import { getLanguage, SUPPORTED_LANGUAGES } from "@/lib/languages";

export type DetectedLanguage = {
  code: string;
  confidence: number;
  signals: string[];
};

const ranges: Array<{code:string; re:RegExp}> = [
  {code:"ml-IN",re:/[\u0D00-\u0D7F]/g},
  {code:"hi-IN",re:/[\u0900-\u097F]/g},
  {code:"bn-IN",re:/[\u0980-\u09FF]/g},
  {code:"pa-IN",re:/[\u0A00-\u0A7F]/g},
  {code:"gu-IN",re:/[\u0A80-\u0AFF]/g},
  {code:"ta-IN",re:/[\u0B80-\u0BFF]/g},
  {code:"te-IN",re:/[\u0C00-\u0C7F]/g},
  {code:"kn-IN",re:/[\u0C80-\u0CFF]/g},
  {code:"ur-IN",re:/[\u0600-\u06FF]/g},
  {code:"ar-SA",re:/[\u0600-\u06FF]/g},
  {code:"ja-JP",re:/[\u3040-\u30FF]/g},
  {code:"ko-KR",re:/[\uAC00-\uD7AF]/g},
];

const romanized: Record<string,string[]> = {
  "ml-IN":["ente","ningal","njan","ivide","entha","engane","cheyyam","venam","alle","aayirikkum","sheri"],
  "hi-IN":["mera","mujhe","aap","kya","kaise","hai","hain","karna","chahiye"],
  "ta-IN":["enna","naan","ungal","epdi","eppadi","irukku","venum"],
  "te-IN":["nenu","meeru","ela","enti","undi","kavali"],
  "kn-IN":["nanu","neevu","hege","enu","beku"],
};

export function detectLanguage(text:string): DetectedLanguage {
  const input=text.trim();
  if(!input) return {code:"en-US",confidence:0,signals:["empty"]};

  const scores=new Map<string,number>();
  for(const {code,re} of ranges){
    const count=(input.match(re)||[]).length;
    if(count) scores.set(code,(scores.get(code)||0)+Math.min(1,count/Math.max(4,input.length))*0.85);
  }

  const lower=input.toLowerCase();
  for(const [code,words] of Object.entries(romanized)){
    const hits=words.filter(w=>new RegExp(`\\b${w}\\b`,"i").test(lower)).length;
    if(hits) scores.set(code,(scores.get(code)||0)+Math.min(0.7,hits*0.18));
  }

  const ranked=[...scores.entries()].sort((a,b)=>b[1]-a[1]);
  if(!ranked.length) return {code:"en-US",confidence:0.35,signals:["latin-script-default"]};
  const [code,score]=ranked[0];
  const supported=SUPPORTED_LANGUAGES.some(l=>l.code===code);
  return {code:supported?code:"en-US",confidence:Math.min(0.99,score),signals:[`script/lexical match: ${getLanguage(code).name}`]};
}
