import { Link, createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Disclaimer, PageHeader, PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  roleLabels,
  roleReportPath,
  usePulse,
  type Role,
} from "@/lib/pulse-context";

const validRoles: Role[] = ["citizen", "doctor", "volunteer", "lab", "pharmacy"];

const credentialCopy: Record<Role, { label: string; placeholder: string; hint: string }> = {
  citizen: {
    label: "Mobile number",
    placeholder: "98XXXXXXXX",
    hint: "We send a one-time code. Your number is never shown on the map.",
  },
  doctor: {
    label: "Medical licence number",
    placeholder: "MCI/2019/44821",
    hint: "Demo verification — a real deployment checks the medical council registry.",
  },
  volunteer: {
    label: "ID proof number",
    placeholder: "ASHA-TH-10293",
    hint: "Demo verification — a real deployment checks the ASHA/PHC register.",
  },
  lab: {
    label: "Lab licence number",
    placeholder: "LAB/MH/2021/7734",
    hint: "Demo verification — a real deployment checks the lab accreditation registry.",
  },
  pharmacy: {
    label: "Pharmacy licence number",
    placeholder: "PH/MH/20B/5521",
    hint: "Demo verification — a real deployment checks the pharmacy council registry.",
  },
};

export const Route = createFileRoute("/verify/$role")({
  loader: ({ params }) => {
    if (!validRoles.includes(params.role as Role)) throw notFound();
    return { role: params.role as Role };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Verification unavailable — Pulse" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `Verify as ${roleLabels[loaderData.role]} — Pulse`;
    return {
      meta: [
        { title },
        {
          name: "description",
          content: `Demo verification step for the ${roleLabels[loaderData.role]} reporting tier on Pulse.`,
        },
        { property: "og:title", content: title },
        {
          property: "og:description",
          content: "Verify your reporting tier to unlock the matching report form.",
        },
      ],
    };
  },
  component: Verify,
});

function Verify() {
  const { role } = Route.useLoaderData();
  const { signIn } = usePulse();
  const navigate = useNavigate();
  const copy = credentialCopy[role];

  const [credential, setCredential] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");

  const finish = () => {
    signIn({
      role,
      displayName:
        name.trim() || (role === "citizen" ? "Anonymous citizen" : roleLabels[role]),
      credential: credential.trim(),
    });
    toast.success("Verified — reporting unlocked (demo)");
    navigate({ to: roleReportPath[role] });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (role === "citizen") {
      if (!otpSent) {
        if (credential.trim().length < 6) {
          toast.error("Enter a mobile number first");
          return;
        }
        setOtpSent(true);
        toast.info("Demo code sent — enter any 6 digits");
        return;
      }
      if (otp.trim().length !== 6) {
        toast.error("Enter the 6-digit code");
        return;
      }
      finish();
      return;
    }
    if (credential.trim().length < 4) {
      toast.error("Enter your registration number");
      return;
    }
    finish();
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="Step 2 of 2"
        title={`Verify as ${roleLabels[role]}`}
        description="Demo-tier verification. Nothing you type is checked against a real registry or stored anywhere."
      />
      <div className="mx-auto w-full max-w-xl space-y-6 px-4 py-12 sm:px-6">
        <Link
          to="/auth"
          className="inline-flex items-center text-sm text-muted-foreground"
        >
          <ArrowLeft className="mr-1.5 size-4" /> Choose a different role
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="size-4 text-primary" />
              {copy.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="credential">{copy.label}</Label>
                <Input
                  id="credential"
                  value={credential}
                  placeholder={copy.placeholder}
                  onChange={(e) => setCredential(e.target.value)}
                  disabled={otpSent}
                />
                <p className="text-xs text-muted-foreground">{copy.hint}</p>
              </div>

              {role !== "citizen" ? (
                <div className="space-y-2">
                  <Label htmlFor="name">Name of reporter or facility</Label>
                  <Input
                    id="name"
                    value={name}
                    placeholder="Optional"
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              ) : null}

              {otpSent ? (
                <div className="space-y-2">
                  <Label htmlFor="otp">One-time code</Label>
                  <Input
                    id="otp"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    placeholder="123456"
                    className="numeral tracking-[0.4em]"
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Demo build — any six digits are accepted.
                  </p>
                </div>
              ) : null}

              <Button type="submit" className="w-full">
                {role === "citizen"
                  ? otpSent
                    ? "Verify and continue"
                    : "Send one-time code"
                  : "Verify and continue"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Disclaimer />
      </div>
    </PageShell>
  );
}
