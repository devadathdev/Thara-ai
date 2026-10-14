import { createHash, randomBytes } from "node:crypto";
import { db } from "@/lib/db";
export const SESSION_COOKIE = "thara_session";
const TTL = 7 * 24 * 60 * 60 * 1000;
function cookieValue(request: Request, name: string) { for (const part of (request.headers.get("cookie")||"").split(";")) { const i=part.indexOf("="); if(i>=0&&part.slice(0,i).trim()===name)return decodeURIComponent(part.slice(i+1).trim()); } return null; }
export function cookieHeader(token:string,request:Request,maxAge=Math.floor(TTL/1000)){const secure=new URL(request.url).protocol==="https:";return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure?"; Secure":""}`;}
export function clearSessionCookie(request:Request){return cookieHeader("",request,0);}
export async function createLocalSession(ownerId:string){const token=randomBytes(32).toString("base64url"),now=Date.now(),expiresAt=now+TTL;await db.session.create({data:{tokenHash:createHash("sha256").update(token).digest("hex"),ownerId,createdAt:now,lastSeenAt:now,expiresAt}});return{token,expiresAt};}
export async function verifyBearerToken(request:Request){const token=cookieValue(request,SESSION_COOKIE);if(!token||token.length>256)throw new Error("Local session required");const tokenHash=createHash("sha256").update(token).digest("hex");const session=await db.session.findUnique({where:{tokenHash},include:{owner:{select:{id:true,username:true}}}});if(!session||session.expiresAt<=Date.now()){if(session)await db.session.delete({where:{id:session.id}}).catch(()=>undefined);throw new Error("Local session expired");}await db.session.update({where:{id:session.id},data:{lastSeenAt:Date.now()}});return{uid:session.owner.id,username:session.owner.username};}
export async function localSetupStatus(){return{setupRequired:(await db.owner.count())===0};}
