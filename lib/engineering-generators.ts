export type EngineeringArtifactKind = "openscad" | "freecad-python" | "openfoam-case";
export type EngineeringArtifact = { filename: string; content: string; kind: EngineeringArtifactKind };
function boundedNumber(input: Record<string, unknown>, key: string, fallback: number) {
  const value = Number(input[key]);
  return Number.isFinite(value) ? Math.max(0.1, Math.min(10_000, value)) : fallback;
}
export function generateEngineeringArtifact(kind: EngineeringArtifactKind, input: Record<string, unknown>): EngineeringArtifact {
  const width = boundedNumber(input,"width",20), depth = boundedNumber(input,"depth",20), height = boundedNumber(input,"height",20);
  if (kind === "openscad") return { kind, filename:"thara-part.scad", content:`// THARA generated parametric starter artifact; review before use.\nwidth = ${width};\ndepth = ${depth};\nheight = ${height};\n$fn = 48;\n\ncube([width, depth, height], center = true);\n` };
  if (kind === "freecad-python") return { kind, filename:"thara-part.py", content:`# THARA generated FreeCAD starter artifact; review before use.\nimport FreeCAD as App\nimport Part\ndoc = App.newDocument("TharaPart")\nshape = Part.makeBox(${width}, ${depth}, ${height})\nobj = doc.addObject("Part::Feature", "Part")\nobj.Shape = shape\ndoc.recompute()\n` };
  return { kind, filename:"blockMeshDict.template", content:`// THARA OpenFOAM starter template; fill solver-specific parameters and validate before simulation.\n// bounded dimensions (m): width=${width}, depth=${depth}, height=${height}\nconvertToMeters 1;\nvertices ();\nblocks ();\nedges ();\nboundary ();\nmergePatchPairs ();\n` };
}
