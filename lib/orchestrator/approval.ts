import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import type { MissionAction } from "@/lib/orchestrator/mission";

const TOKEN_TTL_MS = 5 * 60_000;
type ApprovalClaims = {
  v: 1; jti: string; uid: string; missionId: string; planHash: string;
  actions: MissionAction[]; iat: number; exp: number;
};

function secret() {
  const value = process.env.THARA_APPROVAL_SECRET;
  if (!value || value.length < 32) throw new Error("THARA_APPROVAL_SECRET must be configured with at least 32 characters");
  return value;
}
function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function issueApprovalToken(input: { uid: string; missionId: string; planHash: string; actions: MissionAction[] }) {
  const now = Date.now();
  const claims: ApprovalClaims = {
    v: 1, jti: randomUUID(), uid: input.uid, missionId: input.missionId,
    planHash: input.planHash, actions: [...new Set(input.actions)], iat: now, exp: now + TOKEN_TTL_MS
  };
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  return { token: payload + "." + sign(payload), claims, expiresAt: claims.exp };
}

export function verifyApprovalToken(token: unknown, expected: { uid: string; missionId: string; planHash: string; action: MissionAction }) {
  if (typeof token !== "string" || token.length > 4096) throw new Error("Approval token is missing or invalid");
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) throw new Error("Malformed approval token");
  const expectedSignature = sign(payload);
  const actual = Buffer.from(signature);
  const wanted = Buffer.from(expectedSignature);
  if (actual.length !== wanted.length || !timingSafeEqual(actual, wanted)) throw new Error("Invalid approval signature");
  let claims: ApprovalClaims;
  try { claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as ApprovalClaims; }
  catch { throw new Error("Invalid approval claims"); }
  if (claims.v !== 1 || !claims.jti || claims.exp <= Date.now()) throw new Error("Approval token expired or invalid");
  if (claims.uid !== expected.uid || claims.missionId !== expected.missionId || claims.planHash !== expected.planHash) {
    throw new Error("Approval scope does not match this mission");
  }
  if (!Array.isArray(claims.actions) || !claims.actions.includes(expected.action)) throw new Error("Approval does not include this action");
  return claims;
}
