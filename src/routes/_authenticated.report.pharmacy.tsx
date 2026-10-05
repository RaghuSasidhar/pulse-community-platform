import { useReportText } from "@/lib/report-translations";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { ReportFrame } from "@/components/report-frame";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MY_AREA_ZONE_ID } from "@/data/zones";
import { useZones } from "@/lib/zones-context";
import { usePulse } from "@/lib/pulse-context";

export const Route = createFileRoute("/_authenticated/report/pharmacy")({
  head: () => ({
    meta: [
      { title: "Pharmacy report — Pulse" },
      {
        name: "description",
        content:
          "Report over-the-counter medicine demand by symptom category, an early indicator of illness activity in an area.",
      },
      { property: "og:title", content: "Pharmacy report — Pulse" },
      {
        property: "og:description",
        content: "Medicine-demand signals by symptom category (draft form).",
      },
    ],
  }),
  component: PharmacyReport,
});

const categories = [
  { key: "Fever / paracetamol", label: "Fever medication (paracetamol)" },
  { key: "Cough & cold", label: "Cough and cold preparations" },
  { key: "ORS / anti-diarrhoeal", label: "ORS and anti-diarrhoeals" },
  { key: "Antiemetics", label: "Anti-vomiting medication" },
  { key: "Eye drops", label: "Eye drops / antibacterial eye care" },
  { key: "Skin / antihistamine", label: "Skin and antihistamine products" },
];

function PharmacyReport() {
  const tr = useReportText();
  const { addReport } = usePulse();
  const { getZone } = useZones();
  const navigate = useNavigate();
  const [zoneId, setZoneId] = useState(MY_AREA_ZONE_ID);
  const [values, setValues] = useState<Record<string, string>>({});
  const [baseline, setBaseline] = useState("");
  const [notes, setNotes] = useState("");

  const submit = () => {
    const filled = categories
      .filter((c) => (values[c.key] ?? "").trim() !== "")
      .map((c) => `${c.key}: ${values[c.key]} units this week`);
    if (!filled.length) {
      toast.error(tr("Enter at least one category volume"));
      return;
    }
    const zone = getZone(zoneId);
    if (!zone) return;
    addReport({
      role: "pharmacy",
      zoneId,
      zoneName: zone.name,
      title: "OTC demand signal",
      details: [
        ...filled,
        ...(baseline.trim() ? [`Typical weekly baseline: ${baseline}`] : []),
        ...(notes.trim() ? [`Note: ${notes.trim()}`] : []),
      ],
    });
    navigate({ to: "/report/submitted" });
  };

  return (
    <ReportFrame
      eyebrow={tr("Pharmacy report")}
      title={tr("Medicine demand this week")}
      description={tr("Sales volume by symptom category often moves before anyone visits a clinic, which makes it a useful leading indicator.")}
      zoneId={zoneId}
      onZoneChange={setZoneId}
      onSubmit={submit}
      aside={
        <Card className="border-dashed bg-secondary/40">
          <CardContent className="p-5 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{tr("Draft form.")}</span> {tr("The pharmacy reporting schema is still an open question in the product spec. This version captures OTC volume by symptom category — the likely shape — and will change once the schema is settled.")}
          </CardContent>
        </Card>
      }
    >
      <div className="space-y-3">
        <Label>{tr("Units sold this week, by symptom category")}</Label>
        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map((c) => (
            <div key={c.key} className="space-y-2">
              <Label
                htmlFor={c.key}
                className="text-sm font-normal text-muted-foreground"
              >
                {tr(c.label)}
              </Label>
              <Input
                id={c.key}
                type="number"
                value={values[c.key] ?? ""}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [c.key]: e.target.value }))
                }
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2 sm:max-w-xs">
        <Label htmlFor="baseline">{tr("Typical weekly total (optional)")}</Label>
        <Input
          id="baseline"
          type="number"
          value={baseline}
          onChange={(e) => setBaseline(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          {tr("A baseline helps separate a real spike from an ordinarily busy shop.")}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pharm-notes">{tr("Note (optional)")}</Label>
        <Textarea
          id="pharm-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={tr("Stock-outs, unusual requests, repeat customers")}
        />
      </div>
    </ReportFrame>
  );
}
