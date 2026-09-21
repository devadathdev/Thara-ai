import { createHmac, timingSafeEqual } from "node:crypto";
import type { ProtectedArea } from "@/lib/protected-auth";

const ttl=5*60*1000;

function secret(){const s=process.env.THARA_LINE_CLEAR_SECRET;if(!s||s.length<32)throw new Error("THARA_LINE_CLEAR_SECRET is not configured");return s}
function sign(value:string){return createHmac("sha256",secret()).update(value).digest("base64url")}

export function issueLineClearToken(uid:string,area:ProtectedArea){
 const payload=Buffer.from(JSON.stringify({uid,area,exp:Date.now()+ttl})).toString("base64url");
 return `${payload}.${sign(payload)}`;
}
export function verifyLineClearToken(token:string,uid:string,area:ProtectedArea){
 const [payload,sig]=token.split(".");
 if(!payload||!sig)return false;
 const expected=sign(payload);
 const a=Buffer.from(sig),b=Buffer.from(expected);
 if(a.length!==b.length||!timingSafeEqual(a,b))return false;
 try{const data=JSON.parse(Buffer.from(payload,"base64url").toString());return data.uid===uid&&data.area===area&&Number(data.exp)>Date.now()}catch{return false}
}
