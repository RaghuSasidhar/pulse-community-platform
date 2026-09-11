import { Link, createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";

import { PageHeader, PageShell } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { roleLabels, roleReportPath, usePulse } from "@/lib/pulse-context";

export const Route = createFileRoute("/_authenticated/my-reports")({
  head: () => ({
    meta: [
      { title: "My reports — Pulse" },
      {
        name: "description",
        content: "Everything you have submitted in this session, with the area each report counted towards.",
      },
      { property: "og:title", content: "My reports — Pulse" },
      {
        property: "og:description",
        content: "A record of your submissions in this session.",
      },
    ],
  }),
  component: MyReports;
});

function MyReports() {
  const { reports, session } = usePulse();

  return (
    <PageShell>
      <PageHeader
        eyebrow={session ? roleLabels[session.role] : "Reports"}
        title="My reports"
        description="Submissions from this session. Nothing here is shared with a public zone until it joins enough comparable reports."
      />
      <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-12 sm:px-6">
        {reports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center p-12 text-center">
              <FileText className="size-8 text-muted-foreground" />
              <p className="mt-4 font-medium">No reports yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Anything you submit in this session shows up here.
              </p>
              {session ? (
                <Button asChild className="mt-6">
                  <Link to={roleReportPath[session.role]}>Submit a report</Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ) : (
          reports.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{r.title}</p>
                  <Badge variant="secondary">{roleLabels[r.role]}</Badge>
                </div>
                <p className="numeral mt-1 text-xs text-muted-foreground">
                  {r.zoneName} · {new Date(r.submittedAt).toLocaleString()}
                </p>
                <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {r.details.map((d) => (
                    <li key={d} className="flex gap-2">
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                      {d}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/zone/$zoneId"
                  params={{ zoneId: r.zoneId }}
                  className="mt-3 inline-flex text-xs font-medium text-primary"
                >
                  View {r.zoneName}
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </PageShell>
  );
}
