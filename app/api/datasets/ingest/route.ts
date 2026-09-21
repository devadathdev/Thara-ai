export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { verifyBearerToken } from "@/lib/firebase-admin";
import { normalizeDataset } from "@/lib/dataset-hub";

function allowed(url: string) {
  try {
    const u = new URL(url);
    return (
      (u.protocol === "https:" || u.protocol === "http:") &&
      !u.username &&
      !u.password &&
      !["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(u.hostname) &&
      !/^10\.|^192\.168\.|^169\.254\.|^172\.(1[6-9]|2\d|3[01])\./.test(u.hostname)
    );
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyBearerToken(req);
    const d = normalizeDataset(await req.json());

    if (!allowed(d.url)) {
      return NextResponse.json({ error: "Blocked dataset URL" }, { status: 400 });
    }

    const r = await fetch(d.url, {
      redirect: "manual",
      signal: AbortSignal.timeout(12000),
      headers: { "User-Agent": "THARA-Dataset-Hub/1.0" },
    });

    if (!r.ok) {
      return NextResponse.json(
        { error: `Dataset metadata fetch failed (${r.status})` },
        { status: 400 },
      );
    }

    const type = r.headers.get("content-type") || "";
    const len = Number(r.headers.get("content-length") || 0);

    if (len > 25_000_000) {
      return NextResponse.json(
        { error: "Dataset exceeds safe preview limit; register metadata instead." },
        { status: 413 },
      );
    }

    const text = (await r.text()).slice(0, 12000);
    const lower = text.toLowerCase();
    const executableSignals =
      lower.includes("eval(") ||
      lower.includes("powershell") ||
      lower.includes("cmd.exe") ||
      lower.includes("#!/bin/") ||
      lower.includes("<script");
    const sensitiveFieldSignals =
      /\b(?:password|passwd|private[_ -]?key|secret|api[_ -]?key)\b/i.test(text);

    await getFirestore()
      .collection("users")
      .doc(user.uid)
      .collection("datasets")
      .doc(d.id)
      .set(
        {
          ...d,
          status: "indexed",
          preview: {
            contentType: type,
            bytes: len || text.length,
            text,
            executableSignals,
            sensitiveFieldSignals,
          },
          updatedAt: Date.now(),
        },
        { merge: true },
      );

    return NextResponse.json({
      ok: true,
      dataset: { ...d, status: "indexed" },
      quality: { executableSignals, sensitiveFieldSignals },
    });
  } catch (e) {
    console.error("dataset_ingest_error", e);
    return NextResponse.json({ error: "Dataset ingestion failed" }, { status: 502 });
  }
}
