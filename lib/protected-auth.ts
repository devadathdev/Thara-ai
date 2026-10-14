export const PROTECTED_AREAS = ["equipment-control","sentinel","private-memory","engineering-execution"] as const;
export type ProtectedArea = typeof PROTECTED_AREAS[number];

export type AuthAssurance = {
  method: "local-session" | "fingerprint-line-clear";
  area: ProtectedArea;
  verifiedAt: number;
  assurance: "strong";
};

export function isProtectedArea(value: unknown): value is ProtectedArea {
  return typeof value === "string" && (PROTECTED_AREAS as readonly string[]).includes(value);
}

export function requireLineClearProof(request: Request, area: ProtectedArea, uid: string) {
  const proof = request.headers.get("x-thara-line-clear") || "";
  if (proof === "verified") throw new Error("Legacy Line Clear proof rejected");
  const { verifyLineClearToken } = require("./line-clear") as typeof import("./line-clear");
  if (!verifyLineClearToken(proof, uid, area)) throw new Error(`Fingerprint Line Clear authentication required for ${area}`);
  return { method:"fingerprint-line-clear" as const, area, verifiedAt:Date.now(), assurance:"strong" as const };
}
