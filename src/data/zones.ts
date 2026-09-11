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

export const MY_AREA_ZONE_ID = "z-kalyan-east";

export const zones: Zone[] = [
  {
    id: "z-kalyan-east",
    name: "Kalyan East",
    district: "Thane",
    lat: 19.2437,
    lng: 73.1355,
    population: 148000,
    severity: "high",
    severityScore: 71,
    trend: "rising",
    trendPct: 34,
    topSignals: [
      { label: "Fever (3+ days)", count: 42 },
      { label: "Cough", count: 38 },
      { label: "Body pains", count: 21 },
    ],
    sources: { citizen: 42, doctor: 3, volunteer: 2, lab: 1, pharmacy: 2 },
    summary:
      "42 citizen fever and cough reports, 3 GP syndromic notifications, 1 lab-confirmed case and 2 volunteer household alerts this week. The pattern is consistent with a rising respiratory illness cluster concentrated near the eastern ward boundary.",
    possibleReason:
      "Possibly linked to the seasonal post-monsoon respiratory wave seen in this district in previous years. This is one plausible explanation only — it has not been confirmed by any health authority.",
    precautions: [
      "Wear a mask in crowded indoor spaces for the next two weeks",
      "Keep windows open where possible to improve ventilation",
      "Seek care if fever persists beyond three days or breathing feels difficult",
      "Keep young children and elderly relatives away from large gatherings",
    ],
    weekly: [18, 22, 27, 31, 40, 52, 68],
    publiclyVisible: true,
  },
  {
    id: "z-dombivli",
    name: "Dombivli West",
    district: "Thane",
    lat: 19.2183,
    lng: 73.0868,
    population: 121000,
    severity: "moderate",
    severityScore: 48,
    trend: "rising",
    trendPct: 12,
    topSignals: [
      { label: "Stomach upset", count: 26 },
      { label: "Vomiting", count: 14 },
      { label: "Headache", count: 9 },
    ],
    sources: { citizen: 26, doctor: 2, volunteer: 3, lab: 0, pharmacy: 4 },
    summary:
      "26 citizen gastrointestinal reports, 2 OPD triage notes and 4 pharmacy signals showing higher oral rehydration sales. No laboratory confirmation yet.",
    possibleReason:
      "Could relate to a localised water-supply disruption reported in the ward last week. Treat as a possibility pending confirmation.",
    precautions: [
      "Boil or filter drinking water until the signal settles",
      "Use oral rehydration solution early for loose motions",
      "Wash hands before preparing food",
    ],
    weekly: [11, 13, 12, 16, 19, 22, 26],
    publiclyVisible: true,
  },
  {
    id: "z-mulund",
    name: "Mulund North",
    district: "Mumbai Suburban",
    lat: 19.1726,
    lng: 72.9425,
    population: 98000,
    severity: "low",
    severityScore: 19,
    trend: "falling",
    trendPct: -8,
    topSignals: [
      { label: "Cold", count: 12 },
      { label: "Headache", count: 6 },
    ],
    sources: { citizen: 12, doctor: 1, volunteer: 0, lab: 0, pharmacy: 1 },
    summary:
      "Low background activity. 12 mild citizen reports and one GP note this week, slightly down from last week.",
    possibleReason:
      "Consistent with ordinary seasonal background levels for this area.",
    precautions: ["No area-specific precaution needed right now"],
    weekly: [17, 16, 15, 14, 14, 13, 12],
    publiclyVisible: true,
  },
  {
    id: "z-bhiwandi",
    name: "Bhiwandi Central",
    district: "Thane",
    lat: 19.2967,
    lng: 73.0631,
    population: 210000,
    severity: "critical",
    severityScore: 88,
    trend: "rising",
    trendPct: 61,
    topSignals: [
      { label: "Fever (3+ days)", count: 96 },
      { label: "Eye redness", count: 55 },
      { label: "Skin rashes", count: 31 },
    ],
    sources: { citizen: 96, doctor: 9, volunteer: 6, lab: 4, pharmacy: 5 },
    summary:
      "96 citizen reports, 9 clinical notifications, 4 lab confirmations and 6 volunteer household alerts. Fever with eye redness dominates, and professional reporting corroborates the citizen signal strongly.",
    possibleReason:
      "The symptom mix is compatible with a mosquito-borne illness cluster, which this district has recorded in comparable weeks before. Stated as a possibility, not a diagnosis.",
    precautions: [
      "Remove standing water around homes and rooftops",
      "Use mosquito nets and repellents, especially at dawn and dusk",
      "Do not self-medicate fever with painkillers other than paracetamol",
      "Seek care early for fever with rash or bleeding gums",
    ],
    weekly: [21, 30, 44, 55, 70, 84, 96],
    publiclyVisible: true,
  },
  {
    id: "z-ambernath",
    name: "Ambernath",
    district: "Thane",
    lat: 19.2094,
    lng: 73.1875,
    population: 87000,
    severity: "moderate",
    severityScore: 41,
    trend: "steady",
    trendPct: 2,
    topSignals: [
      { label: "Cough", count: 19 },
      { label: "Cold", count: 17 },
    ],
    sources: { citizen: 19, doctor: 2, volunteer: 1, lab: 0, pharmacy: 2 },
    summary:
      "Steady low-to-moderate respiratory activity, unchanged from last week across all reporting sources.",
    possibleReason:
      "Likely ordinary seasonal circulation of common respiratory infections.",
    precautions: [
      "Stay home while symptomatic if you can",
      "Cover coughs and sneezes",
    ],
    weekly: [18, 19, 18, 20, 19, 19, 19],
    publiclyVisible: true,
  },
  {
    id: "z-panvel",
    name: "Panvel",
    district: "Raigad",
    lat: 18.9894,
    lng: 73.1175,
    population: 132000,
    severity: "low",
    severityScore: 24,
    trend: "steady",
    trendPct: -1,
    topSignals: [
      { label: "Cold", count: 14 },
      { label: "Stomach upset", count: 7 },
    ],
    sources: { citizen: 14, doctor: 1, volunteer: 1, lab: 0, pharmacy: 0 },
    summary: "Background-level activity with no clustering of note.",
    possibleReason: "No unusual pattern detected.",
    precautions: ["No area-specific precaution needed right now"],
    weekly: [15, 14, 13, 15, 14, 14, 14],
    publiclyVisible: true,
  },
  {
    id: "z-titwala",
    name: "Titwala",
    district: "Thane",
    lat: 19.2955,
    lng: 73.2036,
    population: 54000,
    severity: "moderate",
    severityScore: 37,
    trend: "rising",
    trendPct: 22,
    topSignals: [{ label: "Fever (3+ days)", count: 23 }],
    sources: { citizen: 23, doctor: 0, volunteer: 0, lab: 0, pharmacy: 0 },
    summary:
      "23 near-identical citizen fever reports arrived within a four-hour window, with no corroborating clinical, lab or volunteer data.",
    possibleReason:
      "Pattern shape does not resemble organic community spread. Held back from the public map pending human review.",
    precautions: ["Under review — no public guidance issued"],
    weekly: [2, 1, 2, 3, 2, 4, 23],
    publiclyVisible: false,
    anomalyFlag: "Synthetic burst suspected — identical symptom set, single device cluster",
  },
  {
    id: "z-badlapur",
    name: "Badlapur East",
    district: "Thane",
    lat: 19.1552,
    lng: 73.2686,
    population: 76000,
    severity: "low",
    severityScore: 14,
    trend: "falling",
    trendPct: -15,
    topSignals: [{ label: "Cough", count: 8 }],
    sources: { citizen: 8, doctor: 1, volunteer: 0, lab: 0, pharmacy: 0 },
    summary:
      "Eight citizen reports this week, below the k-anonymity threshold for detailed public breakdown.",
    possibleReason: "No unusual pattern detected.",
    precautions: ["No area-specific precaution needed right now"],
    weekly: [14, 13, 12, 11, 10, 9, 8],
    publiclyVisible: false,
  },
];

export const K_ANONYMITY_THRESHOLD = 10;

export function getZone(id: string) {
  return zones.find((z) => z.id === id);
}

export function severityFromScore(score: number): SeverityTier {
  if (score >= 75) return "critical";
  if (score >= 55) return "high";
  if (score >= 30) return "moderate";
  return "low";
}

/** A fake/illustrative "detected disease" signal for an area. Demo only. */
export type DiseaseSignal = {
  zoneId: string;
  disease: string;
  matchedSignals: string[];
  affectedEstimate: number;
  confidence: "Low" | "Moderate" | "High";
  trend: "rising" | "steady" | "falling";
  trendPct: number;
  sourceCorroboration: string;
  updatedAgo: string;
};

export const diseaseSignals: Record<string, DiseaseSignal> = {
  "z-kalyan-east": {
    zoneId: "z-kalyan-east",
    disease: "Acute respiratory infection cluster",
    matchedSignals: ["Fever (3+ days)", "Cough", "Body pains"],
    affectedEstimate: 68,
    confidence: "Moderate",
    trend: "rising",
    trendPct: 34,
    sourceCorroboration:
      "Citizen reports + GP syndromic notifications + 1 lab-confirmed case",
    updatedAgo: "12 min ago",
  },
};
