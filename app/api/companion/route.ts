export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { verifyBearerToken } from "@/lib/firebase-admin";

const MAX_MEMORY = 4000;
const MAX_EVENT = 2000;

function db() {
  return getFirestore();
}

export async function GET(req: Request) {
  try {
    const user = await verifyBearerToken(req);
    const snapshot = await db()
      .collection("users")
      .doc(user.uid)
      .collection("memories")
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();

    const memories = snapshot.docs.map((doc) => {
      const data = doc.data();
      const createdAt = typeof data.createdAt === "number"
        ? data.createdAt
        : data.createdAt?.toMillis?.() ?? Date.now();

      return {
        id: doc.id,
        content: String(data.content || ""),
        importance: Number(data.importance || 0.5),
        createdAt,
      };
    });

    return NextResponse.json({
      ok: true,
      presence: "present",
      modes: ["Companion", "Focus", "Builder", "Guardian", "Workshop", "Silent"],
      memories,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("companion_get_error", error);
    return NextResponse.json({ error: "Companion context unavailable" }, { status: 502 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyBearerToken(req);
    const body = await req.json();
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const importance = Math.max(0, Math.min(1, Number(body.importance ?? 0.8)));

    if (!content || content.length > MAX_MEMORY) {
      return NextResponse.json({ error: "Memory must be 1–4000 characters" }, { status: 400 });
    }

    const ref = await db()
      .collection("users")
      .doc(user.uid)
      .collection("memories")
      .add({
        content,
        importance: Number.isFinite(importance) ? importance : 0.8,
        createdAt: Date.now(),
        serverRecordedAt: FieldValue.serverTimestamp(),
      });

    return NextResponse.json({
      ok: true,
      memory: { id: ref.id, content, importance, createdAt: Date.now() },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("companion_memory_error", error);
    return NextResponse.json({ error: "Unable to save companion memory" }, { status: 502 });
  }
}


export async function PUT(req: Request) {
  try {
    const user = await verifyBearerToken(req);
    const body = await req.json();
    const type = typeof body.type === "string" ? body.type.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!type || !message || message.length > MAX_EVENT) {
      return NextResponse.json({ error: "Invalid companion event" }, { status: 400 });
    }
    await db().collection("users").doc(user.uid).collection("companionEvents").add({
      type,
      message,
      createdAt: Date.now(),
      serverRecordedAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("companion_event_error", error);
    return NextResponse.json({ error: "Unable to record companion event" }, { status: 502 });
  }
}
