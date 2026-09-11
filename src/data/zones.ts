export type SeverityTier = "low" | "moderate" | "high" | "critical";

export type SourceMix = {
  citizen: number;
  doctor: number;
  volunteer: number;
  lab: number;
  pharmacy: number;
};

export type Zone = {
  id: string;
  name: string;
  district: string;
  lat: number;
  lng: number;
  population: number;
  severity: SeverityTier;
  severityScore: number; // 0-100
  trend: "rising" | "steady" | "falling";
  trendPct: number;
  topSignals: { label: string; count: number }[];
  sources: SourceMix;
  summary: string;
  possibleReason: string;
  precautions: string[];
  weekly: number[];
  publiclyVisible: boolean;
  anomalyFlag?: string;
};

export const severityOrder: SeverityTier[] = [
  "low",
  "moderate",
  "high",
  "critical",
];

export const severityLabel: Record<SeverityTier, string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
  critical: "Critical",
};

export const severityToken: Record<SeverityTier, string> = {
  low: "bg-sev-1",
  moderate: "bg-sev-2",
  high: "bg-sev-3",
  critical: "bg-sev-4",
};

export const severityChip: Record<SeverityTier, string> = {
  low: "bg-sev-1 text-nightfall",
  moderate: "bg-sev-2 text-nightfall",
  high: "bg-sev-3 text-nightfall",
  critical: "bg-sev-4 text-primary-foreground",
};

export const MY_AREA_ZONE_ID = "z-vijayawada-benz";

export const K_ANONYMITY_THRESHOLD = 10;

export function severityFromScore(score: number): SeverityTier {
  if (score >= 75) return "critical";
  if (score >= 55) return "high";
  if (score >= 30) return "moderate";
  return "low";
}

