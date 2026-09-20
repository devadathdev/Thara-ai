// AES-256-GCM helpers. Keep the master key server-side.
const enc = new TextEncoder(), dec = new TextDecoder();

function b64(bytes: Uint8Array) {
  let s=""; bytes.forEach(b=>s+=String.fromCharCode(b)); return btoa(s);
}
function unb64(s:string) {
  const bin=atob(s); return Uint8Array.from(bin,c=>c.charCodeAt(0));
}

export async function aes256gcmEncrypt(plaintext:string, rawKeyB64:string) {
  const keyBytes=unb64(rawKeyB64);
  if(keyBytes.length!==32) throw new Error("AES key must be exactly 32 bytes");
  const key=await crypto.subtle.importKey("raw",keyBytes,"AES-GCM",false,["encrypt"]);
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const data=await crypto.subtle.encrypt({name:"AES-GCM",iv},key,enc.encode(plaintext));
  return JSON.stringify({v:1,alg:"AES-256-GCM",iv:b64(iv),ct:b64(new Uint8Array(data))});
}
export async function aes256gcmDecrypt(payload:string, rawKeyB64:string) {
  const p=JSON.parse(payload); const keyBytes=unb64(rawKeyB64);
  if(keyBytes.length!==32) throw new Error("AES key must be exactly 32 bytes");
  const key=await crypto.subtle.importKey("raw",keyBytes,"AES-GCM",false,["decrypt"]);
  const data=await crypto.subtle.decrypt({name:"AES-GCM",iv:unb64(p.iv)},key,unb64(p.ct));
  return dec.decode(data);
}