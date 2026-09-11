import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, PageShell } from "@/components/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { K_ANONYMITY_THRESHOLD } from "@/data/zones";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy & data use — Pulse" },
      {
        name: "description",
        content:
          "How Pulse handles reports: pseudonymous citizens, thresholds before anything is public, no person-level tracking.",
      },
      { property: "og:title", content: "Privacy & data use — Pulse" },
      {
        property: "og:description",
        content:
          "Reports are aggregated by area and only surface once enough similar ones cluster together.",
      },
    ],
  }),
  component: Privacy,
});

const sections = [
  {
    title: "Citizens report pseudonymously",
    body: "A citizen report is tied to a verified phone number so the same person cannot flood the map, but that identity is never shown publicly and is never attached to a symptom on the map.",
  },
  {
    title: `Nothing shows until ${K_ANONYMITY_THRESHOLD} similar reports cluster`,
    body: `A zone stays off the public map until at least ${K_ANONYMITY_THRESHOLD} comparable reports exist for it. Below that, one person's report cannot be reverse-identified from the map.`,
  },
  {
    title: "Professionals are verified, not exposed",
    body: "Doctors, labs, pharmacies and volunteers are authenticated because their data is weighted more heavily. Their identity is visible to the verification layer only — never on the public map.",
  },
  {
    title: "No person-level tracking",
    body: "Pulse does no contact tracing and follows no individual case. Location is captured as a zone, not as a precise point tied to a person.",
  },
  {
    title: "Tiered visibility",
    body: "Health officials can see early raw signal for verification. The public map only shows patterns that have cleared the privacy threshold and the anomaly checks.",
  },
  {
    title: "Anti-tampering",
    body: "Rate limits and device-level signals — not identity — blunt coordinated fake-report attacks. Zones whose pattern shape looks synthetic are held back for human review.",
  },
];

function Privacy() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Privacy"
        title="How your report is used"
        description="Pulse only works if people are willing to report. That means an individual report should never be traceable back to a person from anything Pulse shows publicly."
      />
      <div className="mx-auto grid w-full max-w-5xl gap-4 px-4 py-12 sm:px-6">
        {sections.map((s) => (
          <Card key={s.title}>
            <CardHeader>
              <CardTitle className="text-base">{s.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </CardContent>
          </Card>
        ))}
        <p className="mt-4 rounded-lg border border-border bg-secondary/60 p-4 text-xs text-muted-foreground">
          This is a demo build. No real personal data is collected, stored or
          transmitted; everything shown is sample content held in your browser
          for the length of the session.
        </p>
      </div>
    </PageShell>
  );
}
