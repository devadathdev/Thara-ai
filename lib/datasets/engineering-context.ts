import type { DatasetDoc } from "@/lib/datasets/retrieval";
import { retrieveDatasets, datasetContext } from "@/lib/datasets/retrieval";

export function retrieveEngineeringDatasets(datasets: DatasetDoc[], message: string, limit = 8) {
  const engineeringQuery = [
    "engineering CAD CAE manufacturing Industry 4.0",
    message,
    "materials simulation manufacturing telemetry digital twin"
  ].join(" ");
  const matches = retrieveDatasets(datasets, engineeringQuery, limit);
  return { datasets: matches, context: datasetContext(matches) };
}
