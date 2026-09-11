import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, RefreshCw, ShieldAlert, Sparkles } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { getZone, severityChip, severityLabel } from "@/data/zones";
import { usePulse } from "@/lib/pulse-context";
import { summarizeZoneSignals } from "@/lib/zone-summary.functions";
import { cn } from "@/lib/utils";

type Props = {
  zoneId: string;
};

function TrendPill({ trend, trendPct }: { trend: string; trendPct: number }) {
  const arrow = trend === "rising" ? "▲" : trend === "falling" ? "▼" : "→";
  const tone =
    trend === "rising"
      ? "text-red-600"
      : trend === "falling"
        ? "text-emerald-600"
        : "text-muted-foreground";
  return (
    <span className={cn("numeral inline-flex items-center gap-1 text-xs font-medium", tone)}>
      {arrow} {trendPct > 0 ? "+" : ""}
      {trendPct}% wk
    </span>
  );
}

/** AI-written signal panel shown beside the heatmap for the selected area. */
export default function DiseaseAlert({ zoneId }: Props) {
  const zone = getZone(zoneId);
  const { reports } = usePulse();
  const summarize = useServerFn(summarizeZoneSignals);

  const recentReports = reports
    .filter((r) => r.zoneId === zoneId)
    .slice(0, 20)
    .map((r) => `${r.role}: ${r.title} — ${r.details.join("; ")}`);

  const query = useQuery({
    queryKey: ["zone-ai-summary", zoneId, recentReports.length],
    enabled: Boolean(zone),
    staleTime: 5 * 60 * 1000,
    retry: false,
    queryFn: () =>
      summarize({
        data: {
          zoneName: zone!.name,
          district: zone!.district,
          population: zone!.population,
          severityScore: zone!.severityScore,
          trend: zone!.trend,
          trendPct: zone!.trendPct,
          topSignals: zone!.topSignals,
          sources: zone!.sources,
          weekly: zone!.weekly,
          recentReports,
        },
      }),
  });

  if (!zone) return null;

  const ai = query.data;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Activity className="size-5" />
          </span>
          <div>
            <p className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-muted-foreground">
              <Sparkles className="size-3" /> AI signal summary
            </p>
            <h3 className="text-base font-semibold leading-tight">
              {ai ? ai.disease : query.isError ? "Summary unavailable" : "Analysing reports…"}
            </h3>
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

      {query.isPending && (
        <div className="space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )}

      {query.isError && (
        <div className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            {(query.error as Error).message ||
              "The AI summary service could not be reached."}
          </p>
          <button
            type="button"
            onClick={() => query.refetch()}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <RefreshCw className="size-3.5" /> Try again
          </button>
        </div>
      )}

      {ai && (
        <>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="numeral font-medium">
              ~{ai.affectedEstimate} people affected
            </span>
            <TrendPill trend={zone.trend} trendPct={zone.trendPct} />
            <span
              className={cn(
                "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
                ai.confidence === "High"
                  ? "bg-red-100 text-red-700"
                  : ai.confidence === "Moderate"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-600",
              )}
            >
              Confidence: {ai.confidence}
            </span>
          </div>

          <p className="text-sm text-muted-foreground">{ai.summary}</p>

          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Matched signals
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {zone.topSignals.map((s) => (
                <span
                  key={s.label}
                  className="rounded-md bg-sev-2/40 px-2 py-0.5 text-xs font-medium text-nightfall"
                >
                  {s.label} · {s.count}
                </span>
              ))}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Possible reason: </span>
            {ai.possibleReason}
          </p>

          {ai.precautions.length > 0 && (
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {ai.precautions.slice(0, 4).map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          )}
        </>
      )}

      <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
        <ShieldAlert className="size-4 shrink-0" />
        <span>
          AI-generated pattern summary — not a diagnosis or confirmed outbreak.
          Treat as an early indicator pending health-authority review.
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <AlertTriangle className="size-3.5" /> {zone.name}, {zone.district}
        </span>
        <span>
          {query.isFetching ? "Updating…" : `Based on ${reports.filter((r) => r.zoneId === zoneId).length} new report(s) this session`}
        </span>
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
