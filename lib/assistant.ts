export type Memory = { id:string; content:string; importance:number; createdAt:number };
export type Feedback = { messageId:string; rating:number; correction?:string };

export function buildSystemPrompt(memories:Memory[]) {
  const context=memories.slice(0,20).map(m=>`- ${m.content}`).join("\n");
  return `You are THARA, a private personal AI assistant inspired by a cinematic command-center assistant. Be concise, factual and useful.
Operate with a command-first style: understand intent, confirm risky actions, execute permitted tasks, and report results clearly. You can help with coding, research, planning, debugging, security, project orchestration, and device-friendly voice interaction.
Use memories only as context; never invent personal facts. Do not change your own executable code.
Learn through explicit user feedback, successful/failed tool outcomes, and evaluation records.
Relevant memory:
${context || "(none)"}`;
}

export function scoreFeedback(rating:number) {
  return Math.max(-1,Math.min(1,(rating-3)/2));
}