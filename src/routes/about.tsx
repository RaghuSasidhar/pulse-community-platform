import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, PageShell } from "@/components/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Pulse — early community health signals" },
      {
        name: "description",
        content:
          "How Pulse turns everyday reports from citizens, doctors, labs, pharmacies and volunteers into an early area-level illness signal.",
      },
      { property: "og:title", content: "About Pulse" },
      {
        property: "og:description",
        content:
          "An early-warning layer beside official surveillance — area patterns only, never a diagnosis.",
      },
    ],
  }),
  component: About,
});

const isPoints = [
  "An early-warning layer that sits alongside official surveillance",
  "A public, area-level view of where illness activity is clustering",
  "A place where citizens, doctors, labs, pharmacies and volunteers all feed the same picture",
  "A plain-language explanation of what a flagged area is seeing, and what to do about it",
];

const isNotPoints = [
  "Not a diagnostic tool — Pulse never tells you what illness you have",
  "Not a replacement for statutory disease notification",
  "Not person-level tracking — no contact tracing, no case following",
  "Not fully anonymous for professionals, who are verified because their data carries more weight",
];

const steps = [
  {
    title: "1 · People report",
    body: "Citizens tick symptoms and set severity. Professionals submit structured clinical, lab or pharmacy data through role-specific forms.",
  },
  {
    title: "2 · Reports become zones",
    body: "Each report is assigned to a geographic zone. Individual reports stay invisible until enough similar ones cluster in the same zone.",
  },
  {
    title: "3 · Severity is computed",
    body: "Professional and lab reports are weighted more heavily than citizen self-reports. The result is a severity tier, not a raw count.",
  },
  {
    title: "4 · Pattern is explained",
    body: "A plain-language summary rolls up every reporting format into one paragraph, with a hedged possible reason and practical precautions.",
  },
];

function About() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="About"
        title="Signal before the official count"
        description="Illness activity happens in people's everyday lives days or weeks before it reaches a formal case count. Pulse surfaces that pattern early, at area level, and privately enough that people are willing to report."
      />
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-12 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">What Pulse is</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                {isPoints.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    {p}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="border-primary/30 bg-secondary/40">
            <CardHeader>
              <CardTitle className="text-base">What Pulse is not</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                {isNotPoints.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-nightfall" />
                    {p}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-semibold">How a signal is formed</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <Card key={s.title}>
                <CardContent className="p-5">
                  <p className="numeral text-xs uppercase tracking-widest text-primary">
                    {s.title}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed">{s.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
