import { ClientOnly, Link, createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Crosshair, MapPin, OctagonAlert, ShieldAlert, ShieldCheck } from "lucide-react";
import { Suspense, lazy, useEffect, useMemo, useState } from "react";

import DiseaseAlert from "@/components/disease-alert";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MY_AREA_ZONE_ID,
  distanceKm,
  severityChip,
  severityLabel,
  severityOrder,
  severityVerdict,
} from "@/data/zones";
import { usePulse } from "@/lib/pulse-context";
import { useMyLocation } from "@/lib/use-my-location";
import { useZones } from "@/lib/zones-context";

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
  const { zones } = useZones();
  const [focusZoneId, setFocusZoneId] = useState<string | null>(null);
  const { coords, status, request } = useMyLocation();

  const nearest = useMemo(() => {
    if (!coords || !zones.length) return null;
    const ranked = zones
      .map((z) => ({ zone: z, km: distanceKm(coords, z) }))
      .sort((a, b) => a.km - b.km);
    return ranked[0]!;
  }, [coords, zones]);

  const myArea =
    nearest?.zone ?? zones.find((z) => z.id === MY_AREA_ZONE_ID) ?? zones[0]!;

  // Centre the map on the visitor as soon as we know where they are.
  useEffect(() => {
    if (nearest) setFocusZoneId(nearest.zone.id);
  }, [nearest]);

  const locating = status === "asking";
  const locationNote =
    status === "granted" && nearest
      ? `Using your location · nearest monitored area is ${nearest.km < 1 ? "under 1" : Math.round(nearest.km)} km away`
      : status === "denied"
        ? "Location permission was blocked, so we are showing a default area. Allow location in your browser to see your own."
        : status === "unsupported" || status === "error"
          ? "We could not read your location, so we are showing a default area."
          : locating
            ? "Asking your browser for permission to use your location…"
            : null;

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
                onClick={request}
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
            <div className="mt-3 flex items-start gap-3">
              <span
                className={`mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full ${severityChip[myArea.severity]}`}
              >
                {myArea.severity === "low" ? (
                  <ShieldCheck className="size-5" />
                ) : myArea.severity === "moderate" ? (
                  <ShieldAlert className="size-5" />
                ) : (
                  <OctagonAlert className="size-5" />
                )}
              </span>
              <div>
                <p className="text-lg font-semibold leading-snug">
                  {severityVerdict[myArea.severity].label}
                </p>
                <p className="mt-1 text-xs opacity-70">
                  {severityVerdict[myArea.severity].detail}
                </p>
              </div>
            </div>
            <p className="mt-4 text-2xl font-semibold">{myArea.name}</p>
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
            {locationNote ? (
              <p className="mt-3 flex items-start gap-2 text-xs opacity-70">
                <MapPin className="mt-0.5 size-3.5 shrink-0" />
                {locationNote}
              </p>
            ) : null}
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
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{t("dash.legend")}:</span>
            {severityOrder.map((tier) => (
              <span
                key={tier}
                className={`inline-flex items-center rounded-md px-2 py-0.5 font-medium ${severityChip[tier]}`}
              >
                {severityLabel[tier]}
              </span>
            ))}
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <ClientOnly fallback={<Skeleton className="h-[520px] w-full rounded-xl" />}>
              <Suspense fallback={<Skeleton className="h-[520px] w-full rounded-xl" />}>
                <ZoneMap
                  zones={zones}
                  focusZoneId={focusZoneId}
                  onSelectZone={setFocusZoneId}
                  {...(coords ? { userPosition: [coords.lat, coords.lng] as [number, number] } : {})}
                  height="520px"
                />
              </Suspense>
            </ClientOnly>
            <p className="mt-3 text-xs text-muted-foreground">
              Colour intensity reflects computed severity, not raw report volume.
              Zones below the privacy threshold or under anomaly review are not
              shown here.
            </p>
          </div>
          <DiseaseAlert zoneId={myArea.id} />
        </div>
      </section>
    </PageShell>
  );
}
