import { ClientOnly, Link, createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Crosshair } from "lucide-react";
import { Suspense, lazy, useState } from "react";

import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MY_AREA_ZONE_ID,
  severityChip,
  severityLabel,
  zones,
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

function Dashboard() {
  const { t } = usePulse();
  const [focusZoneId, setFocusZoneId] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

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
                className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${severityChip[myArea.severity]}`}
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
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Live severity heatmap</h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{t("dash.legend")}:</span>
            <span>{severityLabel.low}</span>
            <span
              className="h-3 w-28 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg,#2b6cff,#31d2f2,#3ddc4a,#e8e337,#f79626,#e2231a)",
              }}
            />
            <span>{severityLabel.critical}</span>
          </div>
        </div>
        <ClientOnly fallback={<Skeleton className="h-[520px] w-full rounded-xl" />}>
          <Suspense fallback={<Skeleton className="h-[520px] w-full rounded-xl" />}>
            <ZoneMap focusZoneId={focusZoneId} onSelectZone={setFocusZoneId} height="520px" />
          </Suspense>
        </ClientOnly>
        <p className="mt-3 text-xs text-muted-foreground">
          Colour intensity reflects computed severity, not raw report volume.
          Zones below the privacy threshold or under anomaly review are not
          shown here.
        </p>
      </section>
    </PageShell>
  );
}
