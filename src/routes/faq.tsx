import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, PageShell } from "@/components/page-shell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Pulse community health signals" },
      {
        name: "description",
        content:
          "Common questions about reporting, severity colours, verification and what Pulse does and does not claim.",
      },
      { property: "og:title", content: "FAQ — Pulse" },
      {
        property: "og:description",
        content:
          "Answers on reporting, severity, verification and the limits of the platform.",
      },
    ],
  }),
  component: Faq,
});

const faqs = [
  {
    q: "Does Pulse tell me what illness I have?",
    a: "No. Pulse never diagnoses. It shows what a whole area is reporting and, at most, offers a clearly hedged possible explanation for that pattern.",
  },
  {
    q: "Why does the map show colour intensity instead of case numbers?",
    a: "Raw counts are misleading — a dense area produces more reports for the same underlying activity. The colour reflects a computed severity that accounts for population and source weighting.",
  },
  {
    q: "Do I need an account to look at the map?",
    a: "No. The dashboard is fully public. You only sign in when you want to submit a report.",
  },
  {
    q: "Why are doctors and labs verified but citizens are not?",
    a: "Professional data carries more weight in the severity calculation, so it has to be attributable. Citizen reports are pseudonymous and only count once many of them cluster.",
  },
  {
    q: "What stops people submitting fake reports?",
    a: "Rate limits, device-level signals, a minimum cluster size before anything becomes public, and an anomaly check that holds back zones whose pattern shape looks synthetic rather than organic.",
  },
  {
    q: "Why is a zone I know about missing from the map?",
    a: "It has either not crossed the privacy threshold yet, or it is flagged for human review. Health officials can see it in the officials console before it becomes public.",
  },
  {
    q: "Which languages are supported?",
    a: "The interface and generated explanations are available in English, Hindi and Marathi in this build, with more planned.",
  },
  {
    q: "Is this the real system?",
    a: "This is a front-end demo. Sign-in is simulated, and every zone, report and explanation on screen is sample content.",
  },
];

function Faq() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="FAQ"
        title="Questions people ask"
        description="What Pulse claims, what it deliberately does not, and how the map behaves."
      />
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </PageShell>
  );
}
