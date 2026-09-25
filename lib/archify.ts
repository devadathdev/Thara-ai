import { existsSync } from "node:fs";
import { join } from "node:path";

export type ArchifyDiagramType =
  | "architecture"
  | "workflow"
  | "sequence"
  | "dataflow"
  | "lifecycle";

export function archifyCapabilities() {
  return {
    name: "Archify",
    version: "2.17",
    upstream: "https://github.com/tt-a1i/archify",
    diagramTypes: ["architecture", "workflow", "sequence", "dataflow", "lifecycle"] as ArchifyDiagramType[],
    outputs: ["interactive-html", "svg", "png", "webm", "share-card"],
    validation: "showcase",
    readOnlyByDefault: true,
  };
}

export function archifyRuntimeStatus() {
  const candidates = [
    process.env.ARCHIFY_BIN,
    join(process.cwd(), "node_modules", "archify", "bin", "archify.mjs"),
  ].filter(Boolean) as string[];

  return {
    configured: candidates.some((path) => existsSync(path)),
    renderer: candidates.find((path) => existsSync(path)) ?? null,
    ciRenderer: "GitHub Actions",
    sourceOfTruth: "docs/architecture/*.json",
  };
}

export function tharaArchitectureSource() {
  return {
    path: "docs/architecture/thara.architecture.json",
    output: "public/archify/thara-runtime-architecture.html",
    command: "node archify/bin/archify.mjs deliver architecture docs/architecture/thara.architecture.json public/archify/thara-runtime-architecture.html --quality showcase --json",
  };
}
