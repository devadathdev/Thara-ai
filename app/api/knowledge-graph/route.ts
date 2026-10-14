export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { verifyBearerToken } from "@/lib/local-auth";
import { buildKnowledgeGraph, enrichKnowledgeGraph } from "@/lib/knowledge-graph";
export async function GET(req: Request) {
  try {
    const user = await verifyBearerToken(req);
    const rows = await db.memory.findMany({ where: { ownerId: user.uid }, orderBy: { createdAt: "desc" }, take: 200 });
    const memories = rows.map(m => ({ id: m.id, content: m.content, createdAt: m.createdAt }));
    return NextResponse.json({ ok: true, ...buildKnowledgeGraph(memories) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { console.error("knowledge_graph_get_error", error); return NextResponse.json({ error: "Knowledge graph unavailable" }, { status: 503 }); }
}
export async function POST(req: Request) {
  try {
    const user = await verifyBearerToken(req), body = await req.json();
    const memoryIds = Array.isArray(body.memoryIds) ? body.memoryIds.filter((x: unknown): x is string => typeof x === "string").slice(0,200) : [];
    const rows = await db.memory.findMany({ where: { ownerId: user.uid }, orderBy: { createdAt: "desc" }, take: 200 });
    const memories = rows.map(m => ({ id: m.id, content: m.content, createdAt: m.createdAt }));
    const filtered = memoryIds.length ? memories.filter(m => memoryIds.includes(m.id)) : memories;
    const graph = await enrichKnowledgeGraph(filtered, buildKnowledgeGraph(filtered));
    await db.knowledgeGraphSnapshot.upsert({ where: { ownerId: user.uid }, create: {
      ownerId: user.uid, nodes: JSON.parse(JSON.stringify(graph.nodes)) as Prisma.InputJsonValue, edges: JSON.parse(JSON.stringify(graph.edges)) as Prisma.InputJsonValue, updatedAt: Date.now(), memoryCount: filtered.length
    }, update: { nodes: JSON.parse(JSON.stringify(graph.nodes)) as Prisma.InputJsonValue, edges: JSON.parse(JSON.stringify(graph.edges)) as Prisma.InputJsonValue, updatedAt: Date.now(), memoryCount: filtered.length } });
    return NextResponse.json({ ok: true, ...graph }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { console.error("knowledge_graph_post_error", error); return NextResponse.json({ error: "Unable to update knowledge graph" }, { status: 503 }); }
}
