export type WakeWordConfig = { phrase:"thara"|"tara"; sensitivity:number; localOnly:boolean };
export const DEFAULT_WAKEWORD_CONFIG: WakeWordConfig = {phrase:"thara",sensitivity:.65,localOnly:true};
export function normalizeWakeWord(text:string){return /\b(thara|tara)\b/i.test(text);}