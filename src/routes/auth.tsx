import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  FlaskConical,
  HeartHandshake,
  Pill,
  Stethoscope,
  User,
} from "lucide-react";

import { Disclaimer, PageHeader, PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import type { Role } from "@/lib/pulse-context";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Choose your reporting role — Pulse" },
      {
        name: "description",
        content:
          "Report as a citizen, doctor, volunteer, laboratory or pharmacy. Each role has its own verification and reporting form.",
      },
      { property: "og:title", content: "Choose your reporting role — Pulse" },
      {
        property: "og:description",
        content:
          "Pick the role that matches how you see illness activity in your area.",
      },
    ],
  }),
  component: RolePicker,
});

const roles: {
  role: Role;
  title: string;
  blurb: string;
  verify: string;
  icon: typeof User;
}[] = [
  {
    role: "citizen",
    title: "General Citizen",
    blurb: "Report your own symptoms in a few taps. Pseudonymous.",
    verify: "Mobile OTP",
    icon: User,
  },
  {
    role: "doctor",
    title: "Doctor",
    blurb: "GP, hospital backend, OPD or private practice clinical data.",
    verify: "Medical licence number",
    icon: Stethoscope,
  },
  {
    role: "volunteer",
    title: "Volunteer / ASHA",
    blurb: "Household tallies, surge alerts and community rumours.",
    verify: "ID proof number",
    icon: HeartHandshake,
  },
  {
    role: "lab",
    title: "Laboratory",
    blurb: "Confirmatory panels, smears and culture results.",
    verify: "Lab licence number",
    icon: FlaskConical,
  },
  {
    role: "pharmacy",
    title: "Pharmacy",
    blurb: "Medicine-demand signals by symptom category.",
    verify: "Pharmacy licence number",
    icon: Pill,
  },
];

function RolePicker() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Sign in to report"
        title="Who is reporting?"
        description="Your role decides which form you get and how much weight your report carries in the severity calculation."
      />
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-12 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map(({ role, title, blurb, verify, icon: Icon }) => (
            <Link key={role} to="/verify/$role" params={{ role }}>
              <Card className="h-full transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
                <CardContent className="p-5">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                    <Icon className="size-5 text-primary" />
                  </span>
                  <p className="mt-4 font-medium">{title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{blurb}</p>
                  <p className="numeral mt-4 text-xs uppercase tracking-widest text-primary">
                    {verify}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
          <Card className="h-full border-dashed bg-secondary/40">
            <CardContent className="p-5">
              <span className="flex size-10 items-center justify-center rounded-lg bg-background">
                <Building2 className="size-5 text-muted-foreground" />
              </span>
              <p className="mt-4 font-medium">Just looking?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                The map is public. No sign-in is needed to view any zone.
              </p>
              <Link
                to="/"
                className="mt-4 inline-flex text-sm font-medium text-primary"
              >
                Back to the map
              </Link>
            </CardContent>
          </Card>
        </div>
        <Disclaimer />
      </div>
    </PageShell>
  );
}
