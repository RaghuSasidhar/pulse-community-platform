import { AlertTriangle, Activity, ShieldAlert } from "lucide-react";
import { Link } from "@tanstack/react-router";

import {
  diseaseSignals,
  getZone,
  severityChip,
  severityLabel,
  type DiseaseSignal,
} from "@/data/zones";
import { cn } from "@/lib/utils";

type Props = {
  zoneId: string;
};

function TrendPill({ signal }: { signal: DiseaseSignal }) {
  const arrow = signal.trend === "rising" ? "▲" : signal.trend === "falling" ? "▼" : "→";
  const tone =
    signal.trend === "rising"
      ? "text-red-600"
      : signal.trend === "falling"
        ? "text-emerald-600"
        : "text-muted-foreground";
  return (
    <span className={cn("numeral inline-flex items-center gap-1 text-xs font-medium", tone)}>
      {arrow} {signal.trendPct > 0 ? "+" : ""}
      {signal.trendPct}% wk
    </span>
  );
}

/** Demo-only "detected disease" panel shown beside the heatmap. */
export default function DiseaseAlert({ zoneId }: Props) {
  const signal = diseaseSignals[zoneId];
  const zone = getZone(zoneId);

  if (!signal || !zone) return null;

  const confidenceTone =
    signal.confidence === "High"
      ? "bg-red-100 text-red-700"
      : signal.confidence === "Moderate"
        ? "bg-amber-100 text-amber-700"
        : "bg-slate-100 text-slate-600";

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Activity className="size-5" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Detected signal
            </p>
            <h3 className="text-base font-semibold leading-tight">{signal.disease}</h3>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
            severityChip[zone.severity],
          )}
        >
          {severityLabel[zone.severity]}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <span className="numeral font-medium">
          ~{signal.affectedEstimate} people affected
        </span>
        <TrendPill signal={signal} />
        <span
          className={cn(
            "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
            confidenceTone,
          )}
        >
          Confidence: {signal.confidence}
        </span>
      </div>

      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Matched signals
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {signal.matchedSignals.map((s) => (
            <span
              key={s}
              className="rounded-md bg-sev-2/40 px-2 py-0.5 text-xs font-medium text-nightfall"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Corroboration: </span>
        {signal.sourceCorroboration}
      </p>

      <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
        <ShieldAlert className="size-4 shrink-0" />
        <span>
          Automated pattern match only — not a diagnosis or confirmed outbreak.
          Treat as an early indicator pending health-authority review.
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <AlertTriangle className="size-3.5" /> {zone.name}, {zone.district}
        </span>
        <span>Updated {signal.updatedAgo}</span>
      </div>

      <Link
        to="/zone/$zoneId"
        params={{ zoneId: zone.id }}
        className="text-sm font-medium text-primary hover:underline"
      >
        View full zone breakdown →
      </Link>
    </div>
  );
}
