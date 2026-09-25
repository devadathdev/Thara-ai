export type SatelliteDataSource = "sentinel" | "landsat" | "modis" | "noaa" | "custom";
export type SatelliteAnalysis = "earth-observation" | "weather" | "land-use" | "change-detection" | "disaster-monitoring" | "environment";

export type SatelliteQuery = {
  source: SatelliteDataSource;
  analysis: SatelliteAnalysis;
  latitude: number;
  longitude: number;
  radiusKm?: number;
  startDate?: string;
  endDate?: string;
};

export type SatelliteInsight = {
  id: string;
  source: SatelliteDataSource;
  analysis: SatelliteAnalysis;
  status: "planned" | "ready";
  query: SatelliteQuery;
  pipeline: string[];
  safety: {
    readOnly: true;
    noSatelliteControl: true;
    externalDataRequired: true;
  };
};

const sources: SatelliteDataSource[] = ["sentinel", "landsat", "modis", "noaa", "custom"];
const analyses: SatelliteAnalysis[] = ["earth-observation","weather","land-use","change-detection","disaster-monitoring","environment"];

export function satelliteIntelligenceCapabilities() {
  return {
    sources,
    analyses,
    capabilities: [
      "satellite imagery discovery",
      "multispectral analysis planning",
      "change detection",
      "land and vegetation monitoring",
      "weather and environmental analysis",
      "disaster-response intelligence",
      "geospatial evidence fusion"
    ],
    execution: {
      level: "execution-ready",
      readOnly: true,
      satelliteControl: false,
      requiresExternalData: true
    }
  };
}

export function planSatelliteAnalysis(query: SatelliteQuery): SatelliteInsight {
  if (!sources.includes(query.source)) throw new Error("Unsupported satellite data source");
  if (!analyses.includes(query.analysis)) throw new Error("Unsupported satellite analysis");
  if (!Number.isFinite(query.latitude) || query.latitude < -90 || query.latitude > 90) throw new Error("Invalid latitude");
  if (!Number.isFinite(query.longitude) || query.longitude < -180 || query.longitude > 180) throw new Error("Invalid longitude");
  if (query.radiusKm !== undefined && (!Number.isFinite(query.radiusKm) || query.radiusKm <= 0 || query.radiusKm > 500)) {
    throw new Error("Invalid analysis radius");
  }

  return {
    id: crypto.randomUUID(),
    source: query.source,
    analysis: query.analysis,
    status: "ready",
    query,
    pipeline: [
      "geospatial query validation",
      "satellite data discovery",
      "cloud/quality filtering",
      "multispectral or temporal analysis",
      "cross-source evidence fusion",
      "confidence and provenance report"
    ],
    safety: { readOnly: true, noSatelliteControl: true, externalDataRequired: true }
  };
}
