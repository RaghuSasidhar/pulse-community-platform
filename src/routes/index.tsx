import { ClientOnly, Link, createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Crosshair, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Suspense, lazy, useState } from "react";

import { PageShell } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MY_AREA_ZONE_ID,
  severityLabel,
  severityToken,
  zones,
  type Zone,
} from "@/data/zones";
import { usePulse } from "@/lib/pulse-context";

const ZoneMap = lazy(() => import("@/components/zone-map"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pulse — Community health signal map" },
      {
        name: "description",
        content:
          "Early, area-level illness signals from citizen, clinical, lab and pharmacy reports — shown as a public severity heatmap.",
      },
      { property: "og:title", content: "Pulse — Community health signal map" },
      {
        property: "og:description",
        content:
          "Early, area-level illness signals from everyday reports. Area patterns only, never a diagnosis.",
      },
    ],
  }),
  component: Dashboard,
});

function TrendIcon({ trend }: { trend: Zone["trend"] }) {
  if (trend === "rising") return <TrendingUp className="size-4" />;
  if (trend === "falling") return <TrendingDown className="size-4" />;
  return <Minus className="size-4" />;
}

function Dashboard() {
  const { t } = usePulse();
  const [focusZoneId, setFocusZoneId] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const publicZones = zones.filter((z) => z.publiclyVisible);
  const myArea = zones.find((z) => z.id === MY_AREA_ZONE_ID)!;

  const handleLocate = () => {
    setLocating(true);
    setTimeout(() => {
      setFocusZoneId(MY_AREA_ZONE_ID);
      setLocating(false);
    }, 600);
  };

  return (
    <PageShell>
      <section className="border-b border-border/70 bg-nightfall text-primary-foreground">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="numeral text-xs uppercase tracking-[0.2em] opacity-70">
              Early warning layer
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              {t("dash.title")}
            </h1>
            <p className="mt-4 max-w-xl text-sm opacity-80 sm:text-base">
              {t("dash.subtitle")}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/auth">{t("cta.report")}</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleLocate}
                className="border-white/25 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
              >
                <Crosshair className="mr-2 size-4" />
                {locating ? "Locating…" : t("dash.locate")}
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-white/15 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-widest opacity-70">
              Your area
            </p>
            <p className="mt-2 text-2xl font-semibold">{myArea.name}</p>
            <p className="numeral mt-1 text-sm opacity-70">
              {myArea.district} · pop. {myArea.population.toLocaleString()}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span
                className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium text-nightfall ${severityToken[myArea.severity]}`}
              >
                {severityLabel[myArea.severity]}
              </span>
              <span className="numeral text-sm opacity-80">
                severity {myArea.severityScore}/100 · {myArea.trendPct > 0 ? "+" : ""}
                {myArea.trendPct}% wk
              </span>
            </div>
            <p className="mt-4 text-sm opacity-80">{myArea.summary}</p>
            <Button asChild variant="secondary" size="sm" className="mt-4">
              <Link to="/zone/$zoneId" params={{ zoneId: myArea.id }}>
                Open zone detail
                <ArrowUpRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Live severity heatmap</h2>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{t("dash.legend")}:</span>
                {(["low", "moderate", "high", "critical"] as const).map((s) => (
                  <span key={s} className="flex items-center gap-1.5">
                    <span className={`size-3 rounded-sm ${severityToken[s]}`} />
                    {severityLabel[s]}
                  </span>
                ))}
              </div>
            </div>
            <ClientOnly fallback={<Skeleton className="h-[480px] w-full rounded-xl" />}>
              <Suspense fallback={<Skeleton className="h-[480px] w-full rounded-xl" />}>
                <ZoneMap focusZoneId={focusZoneId} onSelectZone={setFocusZoneId} />
              </Suspense>
            </ClientOnly>
            <p className="mt-3 text-xs text-muted-foreground">
              Colour intensity reflects computed severity, not raw report volume.
              Zones below the privacy threshold or under anomaly review are not
              shown here.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold">
              {t("dash.zones")} ({publicZones.length})
            </h2>
            <div className="space-y-3">
              {publicZones
                .slice()
                .sort((a, b) => b.severityScore - a.severityScore)
                .map((zone) => (
                  <Card
                    key={zone.id}
                    className="cursor-pointer transition-shadow hover:shadow-md"
                    onClick={() => setFocusZoneId(zone.id)}
                  >
                    <CardContent className="flex items-start gap-4 p-4">
                      <span
                        className={`mt-1 size-3 shrink-0 rounded-full ${severityToken[zone.severity]}`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate font-medium">{zone.name}</p>
                          <Badge variant="secondary" className="numeral shrink-0">
                            {zone.severityScore}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {zone.district} · {severityLabel[zone.severity]}
                        </p>
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <TrendIcon trend={zone.trend} />
                          <span className="numeral">
                            {zone.trendPct > 0 ? "+" : ""}
                            {zone.trendPct}% this week
                          </span>
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {zone.topSignals.slice(0, 2).map((s) => (
                            <Badge key={s.label} variant="outline" className="text-[11px]">
                              {s.label} · {s.count}
                            </Badge>
                          ))}
                        </div>
                        <Link
                          to="/zone/$zoneId"
                          params={{ zoneId: zone.id }}
                          className="mt-3 inline-flex items-center text-xs font-medium text-primary"
                        >
                          View detail <ArrowUpRight className="ml-1 size-3" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
