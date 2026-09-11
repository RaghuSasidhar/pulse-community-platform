import { Link, createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, EyeOff, ShieldAlert } from "lucide-react";

import { PageHeader, PageShell } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { K_ANONYMITY_THRESHOLD, severityChip, severityLabel } from "@/data/zones";
import { useZones } from "@/lib/zones-context";

export const Route = createFileRoute("/officials")({
  head: () => ({
    meta: [
      { title: "Officials console — Pulse early signal review" },
      {
        name: "description",
        content:
          "Raw early signal, zones below the privacy threshold and anomaly-flagged clusters awaiting human review.",
      },
      { property: "og:title", content: "Officials console — Pulse" },
      {
        property: "og:description",
        content:
          "Tiered visibility: officials see early signal before it clears the public threshold.",
      },
    ],
  }),
  component: Officials,
});

function Officials() {
  const { zones } = useZones();
  const anomalies = zones.filter((z) => z.anomalyFlag);
  const withheld = zones.filter((z) => !z.publiclyVisible && !z.anomalyFlag);
  const totalReports = zones.reduce(
    (sum, z) => sum + Object.values(z.sources).reduce((a, b) => a + b, 0),
    0,
  );

  return (
    <PageShell>
      <PageHeader
        eyebrow="Restricted view (demo)"
        title="Officials console"
        description="Everything the public map shows, plus the early signal it deliberately holds back until it clears the privacy threshold and anomaly checks."
      />
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-12 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: "Zones monitored", value: zones.length },
            { label: "Reports this week", value: totalReports },
            { label: "Below threshold", value: withheld.length },
            { label: "Anomaly flags", value: anomalies.length },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </p>
                <p className="numeral mt-2 text-3xl font-semibold">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {anomalies.length ? (
          <Card className="border-primary/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldAlert className="size-4 text-primary" />
                Anomaly review queue
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {anomalies.map((z) => (
                <div
                  key={z.id}
                  className="rounded-lg border border-border bg-secondary/40 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">
                      {z.name} <span className="text-muted-foreground">· {z.district}</span>
                    </p>
                    <Badge variant="outline" className="gap-1">
                      <AlertTriangle className="size-3" /> Held from public map
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{z.anomalyFlag}</p>
                  <p className="mt-2 text-sm">{z.summary}</p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline">
                      Mark as verified
                    </Button>
                    <Button size="sm" variant="ghost">
                      Discard cluster
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">All zones — raw early signal</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zone</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right">Citizen</TableHead>
                  <TableHead className="text-right">Clinical</TableHead>
                  <TableHead className="text-right">Lab</TableHead>
                  <TableHead>Public</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {zones
                  .slice()
                  .sort((a, b) => b.severityScore - a.severityScore)
                  .map((z) => (
                    <TableRow key={z.id}>
                      <TableCell>
                        <Link
                          to="/zone/$zoneId"
                          params={{ zoneId: z.id }}
                          className="font-medium text-primary"
                        >
                          {z.name}
                        </Link>
                        <span className="block text-xs text-muted-foreground">
                          {z.district}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`rounded px-2 py-0.5 text-xs ${severityChip[z.severity]}`}
                        >
                          {severityLabel[z.severity]}
                        </span>
                      </TableCell>
                      <TableCell className="numeral text-right">
                        {z.severityScore}
                      </TableCell>
                      <TableCell className="numeral text-right">
                        {z.sources.citizen}
                      </TableCell>
                      <TableCell className="numeral text-right">
                        {z.sources.doctor + z.sources.volunteer}
                      </TableCell>
                      <TableCell className="numeral text-right">{z.sources.lab}</TableCell>
                      <TableCell>
                        {z.publiclyVisible ? (
                          <Badge variant="secondary">Visible</Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <EyeOff className="size-3" /> Withheld
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <p className="mt-4 text-xs text-muted-foreground">
              Zones stay off the public map until at least {K_ANONYMITY_THRESHOLD}{" "}
              comparable reports cluster and the pattern shape clears anomaly
              checks.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
