import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, RefreshCw, ShieldAlert, Sparkles } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { severityChip } from "@/data/zones";
import { useReportText } from "@/lib/report-translations";
import { useZones } from "@/lib/zones-context";
import { usePulse } from "@/lib/pulse-context";
import { summarizeZoneSignals } from "@/lib/zone-summary.functions";
import { cn } from "@/lib/utils";

type Props = {
  zoneId: string;
};

function TrendPill({ trend, trendPct, isTelugu }: { trend: string; trendPct: number; isTelugu: boolean }) {
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
      {trendPct}% {isTelugu ? "వారానికి" : "wk"}
    </span>
  );
}

/** AI-written signal panel shown beside the heatmap for the selected area. */
export default function DiseaseAlert({ zoneId }: Props) {
  const { getZone } = useZones();
  const zone = getZone(zoneId);
  const { reports, language, t } = usePulse();
  const tr = useReportText();
  const summaryLanguage = language === "te" ? "te" : "en";
  const summarize = useServerFn(summarizeZoneSignals);

  const recentReports = reports
    .filter((r) => r.zoneId === zoneId)
    .slice(0, 20)
    .map((r) => `${r.role}: ${r.title} — ${r.details.join("; ")}`);

  const query = useQuery({
    queryKey: ["zone-ai-summary", zoneId, summaryLanguage, recentReports],
    enabled: Boolean(zone),
    staleTime: 5 * 60 * 1000,
    retry: false,
    queryFn: () => {
      if (!zone) throw new Error("Area unavailable");
      return summarize({
        data: {
          language: summaryLanguage,
          zoneName: zone.name,
          district: zone.district,
          population: zone.population,
          severityScore: zone.severityScore,
          trend: zone.trend,
          trendPct: zone.trendPct,
          topSignals: zone.topSignals,
          sources: zone.sources,
          weekly: zone.weekly,
          recentReports,
        },
      });
    },
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
               <Sparkles className="size-3" /> {tr("AI signal summary")}
            </p>
            <h3 className="text-base font-semibold leading-tight">
              {ai ? ai.disease : query.isError ? tr("Summary unavailable") : tr("Analysing reports…")}
            </h3>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
            severityChip[zone.severity],
          )}
        >
          {t(`severity.${zone.severity}`)}
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
            {tr("The AI summary service could not be reached.")}
          </p>
          <Button
            type="button"
            variant="ghost"
            onClick={() => query.refetch()}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <RefreshCw className="size-3.5" /> {tr("Try again")}
          </Button>
        </div>
      )}

      {ai && (
        <>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="numeral font-medium">
              {language === "te" ? `సుమారు ${ai.affectedEstimate} మందిపై ప్రభావం` : `~${ai.affectedEstimate} people affected`}
            </span>
            <TrendPill trend={zone.trend} trendPct={zone.trendPct} isTelugu={language === "te"} />
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
              {tr("Confidence")}: {tr(ai.confidence)}
            </span>
          </div>

          <p className="text-sm text-muted-foreground">{ai.summary}</p>

          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {tr("Matched signals")}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {zone.topSignals.map((s, index) => (
                <span
                  key={s.label}
                  className="rounded-md bg-sev-2/40 px-2 py-0.5 text-xs font-medium text-nightfall"
                >
                  {ai.signalLabels[index] ?? tr(s.label)} · {s.count}
                </span>
              ))}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{tr("Possible reason")}: </span>
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
          {tr("AI-generated pattern summary — not a diagnosis or confirmed outbreak. Treat as an early indicator pending health-authority review.")}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <AlertTriangle className="size-3.5" /> {zone.name}, {zone.district}
        </span>
        <span>
          {query.isFetching ? tr("Updating…") : language === "te" ? `ఈ సందర్శనలో ${recentReports.length} కొత్త నివేదికల ఆధారంగా` : `Based on ${recentReports.length} new report(s) this session`}
        </span>
      </div>

      <Link
        to="/zone/$zoneId"
        params={{ zoneId: zone.id }}
        className="text-sm font-medium text-primary hover:underline"
      >
        {tr("View full zone breakdown →")}
      </Link>
    </div>
  );
}
