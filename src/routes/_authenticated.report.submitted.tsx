import { Link, createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

import { Disclaimer, PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { K_ANONYMITY_THRESHOLD } from "@/data/zones";
import { usePulse } from "@/lib/pulse-context";

export const Route = createFileRoute("/_authenticated/report/submitted")({
  head: () => ({
    meta: [
      { title: "Report received — Pulse" },
      {
        name: "description",
        content:
          "Your report has been recorded against your area and will only surface publicly once enough similar reports cluster.",
      },
      { property: "og:title", content: "Report received — Pulse" },
      {
        property: "og:description",
        content: "Thanks for reporting. Your submission counts as part of an area pattern.",
      },
    ],
  }),
  component: Submitted,
});

function Submitted() {
  const { reports } = usePulse();
  const latest = reports[0];

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-16 sm:px-6">
        <Card>
          <CardContent className="p-8 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-secondary">
              <CheckCircle2 className="size-7 text-primary" />
            </span>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight">
              Report received
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Thank you. Your report has been recorded against{" "}
              <span className="font-medium text-foreground">
                {latest?.zoneName ?? "your area"}
              </span>
              . It stays invisible on its own and only contributes once at least{" "}
              {K_ANONYMITY_THRESHOLD} comparable reports cluster in the same
              area.
            </p>

            {latest ? (
              <div className="mt-6 rounded-lg border border-border bg-secondary/40 p-4 text-left">
                <p className="text-sm font-medium">{latest.title}</p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {latest.details.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link to="/">Back to the map</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/my-reports">See my reports</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Disclaimer />
      </div>
    </PageShell>
  );
}
