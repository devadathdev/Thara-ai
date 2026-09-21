import { startAuthentication, startRegistration } from "@simplewebauthn/browser";

export async function registerLineClear(token:string) {
  const options=await fetch("/api/auth/line-clear/register/options",{headers:{authorization:`Bearer ${token}`}}).then(r=>r.json());
  if(options.error) throw new Error(options.error);
  const credential=await startRegistration({optionsJSON:options});
  return fetch("/api/auth/line-clear/register/verify",{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${token}`},body:JSON.stringify(credential)}).then(r=>r.json());
}

export async function authenticateLineClear(token:string, area:"equipment-control"|"sentinel"|"private-memory"|"engineering-execution") {
  const options=await fetch("/api/auth/line-clear/auth/options",{headers:{authorization:`Bearer ${token}`}}).then(r=>r.json());
  if(options.error) throw new Error(options.error);
  const credential=await startAuthentication({optionsJSON:options});
  return fetch("/api/auth/line-clear/auth/verify",{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${token}`},body:JSON.stringify({...credential,area})}).then(r=>r.json());
}
