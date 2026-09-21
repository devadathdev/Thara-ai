import type { DatasetDoc } from "@/lib/datasets/retrieval";
import { retrieveEngineeringDatasets } from "@/lib/datasets/engineering-context";

export type EngineeringEvidence = {
  datasets: Pick<DatasetDoc,"id"|"name"|"source"|"url"|"license"|"tags">[];
  context: string;
};

export function buildEngineeringEvidence(datasets: DatasetDoc[], query: string): EngineeringEvidence {
  const result = retrieveEngineeringDatasets(datasets, query, 8);
  return {
    datasets: result.datasets.map(d => ({id:d.id,name:d.name,source:d.source,url:d.url,license:d.license,tags:d.tags})),
    context: result.context
  };
}
