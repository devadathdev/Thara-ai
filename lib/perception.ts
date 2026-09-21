export type PerceptionModality = "image" | "document" | "audio" | "video" | "3d";

export type PerceptionRequest = {
  modality: PerceptionModality;
  source: "upload" | "camera" | "microphone" | "device" | "engineering";
  name?: string;
  metadata?: Record<string, unknown>;
};

export type PerceptionResult = {
  accepted: boolean;
  modality: PerceptionModality;
  pipeline: string[];
  physicalWorldReady: boolean;
};

const pipelines: Record<PerceptionModality,string[]> = {
  image:["ingest","validate","vision analysis","ground findings"],
  document:["ingest","OCR/layout","extract","ground findings"],
  audio:["ingest","speech/audio analysis","segment","ground findings"],
  video:["ingest","frame/audio analysis","temporal reasoning","ground findings"],
  "3d":["ingest","geometry validation","spatial analysis","ground findings"],
};

export function planPerception(request:PerceptionRequest):PerceptionResult {
  if (!pipelines[request.modality]) throw new Error("Unsupported perception modality");
  return {
    accepted:true,
    modality:request.modality,
    pipeline:pipelines[request.modality],
    physicalWorldReady:["camera","microphone","device","engineering"].includes(request.source),
  };
}
