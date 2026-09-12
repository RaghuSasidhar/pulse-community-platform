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
  low: "bg-sev-1 text-sev-foreground",
  moderate: "bg-sev-2 text-nightfall",
  high: "bg-sev-3 text-sev-foreground",
  critical: "bg-sev-4 text-sev-foreground",
};

/** Left accent border used on rows/cards to colour-code a tier. */
export const severityBorder: Record<SeverityTier, string> = {
  low: "border-l-sev-1",
  moderate: "border-l-sev-2",
  high: "border-l-sev-3",
  critical: "border-l-sev-4",
};

/** Plain-language safety verdict for the visitor's own area. */
export const severityVerdict: Record<
  SeverityTier,
  { label: string; detail: string }
> = {
  low: {
    label: "Your area looks safe right now",
    detail:
      "No significant illness signals are clustering here. Keep an eye on this page — it updates as new reports come in.",
  },
  moderate: {
    label: "Your area is mostly safe — stay aware",
    detail:
      "Some illness signals are building up here. Basic precautions are enough for most people.",
  },
  high: {
    label: "Your area is at elevated risk",
    detail:
      "Illness signals are clearly rising here. Follow the precautions listed for this area.",
  },
  critical: {
    label: "Your area is at high risk",
    detail:
      "Strong illness signals are clustering here. Take precautions seriously and watch for updates from health authorities.",
  },
};

/** Great-circle distance in km. */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const MY_AREA_ZONE_ID = "z-vijayawada-benz";

export const K_ANONYMITY_THRESHOLD = 10;

export function severityFromScore(score: number): SeverityTier {
  if (score >= 75) return "critical";
  if (score >= 55) return "high";
  if (score >= 30) return "moderate";
  return "low";
}

