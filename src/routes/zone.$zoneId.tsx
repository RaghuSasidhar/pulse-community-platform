import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, Sparkles } from "lucide-react";

import { Disclaimer, PageShell } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getZone, severityLabel, severityToken } from "@/data/zones";

export const Route = createFileRoute("/zone/$zoneId")({
  loader: ({ params }) => {
    const zone = getZone(params.zoneId);
    if (!zone) throw notFound();
    return { zone };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Zone unavailable — Pulse" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { zone } = loaderData;
    const title = `${zone.name} health signal — Pulse`;
    const description = `Current severity, clustering symptoms and precautions for ${zone.name}, ${zone.district}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ZoneDetail,
});

function ZoneDetail() {
  const { zone } = Route.useLoaderData();
  const maxWeek = Math.max(...zone.weekly);

  const sources = Object.entries(zone.sources) as [string, number][];

  return (
    <PageShell>
      <div className="border-b border-border/70 bg-nightfall text-primary-foreground">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
          <Link to="/" className="inline-flex items-center text-sm opacity-75">
            <ArrowLeft className="mr-1.5 size-4" /> Back to map
          </Link>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {zone.name}
              </h1>
              <p className="numeral mt-1 text-sm opacity-70">
                {zone.district} · pop. {zone.population.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`rounded-md px-3 py-1.5 text-sm font-medium text-nightfall ${severityToken[zone.severity]}`}
              >
                {severityLabel[zone.severity]}
              </span>
              <span className="numeral text-2xl font-semibold">
                {zone.severityScore}
                <span className="text-sm opacity-60">/100</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="size-4 text-primary" />
                What this zone is reporting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed">{zone.summary}</p>
              <div className="rounded-lg border border-border bg-secondary/50 p-4">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Possible reason
                </p>
                <p className="mt-2 text-sm leading-relaxed">{zone.possibleReason}</p>
              </div>
              <Disclaimer />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Seven-week trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-40 items-end gap-3">
                {zone.weekly.map((v, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-md bg-primary/80"
                      style={{ height: `${(v / maxWeek) * 100}%` }}
                    />
                    <span className="numeral text-[11px] text-muted-foreground">
                      {v}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Weekly aggregated reports across all sources. Latest week is on
                the right.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Precautions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {zone.precautions.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    {p}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Clustering signals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {zone.topSignals.map((s) => (
                <div key={s.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{s.label}</span>
                    <span className="numeral text-muted-foreground">{s.count}</span>
                  </div>
                  <Progress
                    value={(s.count / (zone.topSignals[0]?.count || 1)) * 100}
                    className="mt-2"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Report sources this week</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {sources.map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm capitalize"
                >
                  <span>{key}</span>
                  <Badge variant="secondary" className="numeral">
                    {value}
                  </Badge>
                </div>
              ))}
              <p className="pt-2 text-xs text-muted-foreground">
                Professional, lab and pharmacy reports carry more weight than
                citizen self-reports when severity is computed.
              </p>
            </CardContent>
          </Card>

          <Button asChild className="w-full">
            <Link to="/auth">Report something in this area</Link>
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
