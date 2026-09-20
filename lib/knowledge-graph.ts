export type KnowledgeNode = {
  id: string;
  label: string;
  type: "memory" | "person" | "project" | "topic" | "place" | "concept";
  memoryIds: string[];
  updatedAt: number;
};

export type KnowledgeEdge = {
  id: string;
  from: string;
  to: string;
  relation: "related" | "mentions" | "part-of" | "depends-on" | "about";
  weight: number;
  memoryIds: string[];
  updatedAt: number;
};

const STOP = new Set(["the","and","that","this","with","from","have","your","about","into","what","when","where","will","want","like","than","then","they","them","for","you","are","was","were","been","being","can","could","should","would","there","their","my","our"]);

export function extractKeywords(text:string) {
  return [...new Set((text.toLowerCase().match(/[a-z0-9][a-z0-9_-]{3,}/g) || [])
    .filter(x => !STOP.has(x)))].slice(0, 12);
}

export function buildKnowledgeGraph(memories:Array<{id:string;content:string;createdAt:number}>) {
  const nodes = new Map<string, KnowledgeNode>();
  const edges = new Map<string, KnowledgeEdge>();

  for (const memory of memories) {
    const memoryNodeId = `memory:${memory.id}`;
    nodes.set(memoryNodeId, {
      id: memoryNodeId, label: memory.content.slice(0, 80),
      type: "memory", memoryIds: [memory.id], updatedAt: memory.createdAt
    });

    for (const keyword of extractKeywords(memory.content)) {
      const id = `topic:${keyword}`;
      const existing = nodes.get(id);
      nodes.set(id, existing ? {
        ...existing,
        memoryIds: [...new Set([...existing.memoryIds, memory.id])],
        updatedAt: Math.max(existing.updatedAt, memory.createdAt)
      } : {
        id, label: keyword, type: "topic", memoryIds: [memory.id], updatedAt: memory.createdAt
      });

      const edgeId = [memoryNodeId,id].sort().join("::");
      edges.set(edgeId, {
        id: edgeId, from: memoryNodeId, to: id, relation: "mentions",
        weight: (edges.get(edgeId)?.weight || 0) + 1,
        memoryIds: [...new Set([...(edges.get(edgeId)?.memoryIds || []), memory.id])],
        updatedAt: memory.createdAt
      });
    }
  }

  const topicNodes = [...nodes.values()].filter(n => n.type === "topic");
  for (let i=0;i<topicNodes.length;i++) {
    for (let j=i+1;j<topicNodes.length;j++) {
      const shared = topicNodes[i].memoryIds.filter(id => topicNodes[j].memoryIds.includes(id));
      if (!shared.length) continue;
      const edgeId = [topicNodes[i].id,topicNodes[j].id].sort().join("::");
      edges.set(edgeId,{
        id:edgeId,from:topicNodes[i].id,to:topicNodes[j].id,relation:"related",
        weight:shared.length,memoryIds:shared,updatedAt:Date.now()
      });
    }
  }

  return { nodes:[...nodes.values()], edges:[...edges.values()] };
}
