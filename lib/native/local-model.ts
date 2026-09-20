export type LocalModelState = { available:boolean; model?:string; latencyMs?:number };
export async function getLocalModelState(): Promise<LocalModelState> {
  // Browser/server adapter: native Android supplies the real local inference implementation.
  return {available:false};
}
export function shouldUseLocalModel(offline:boolean, local:LocalModelState) {
  return offline && local.available;
}