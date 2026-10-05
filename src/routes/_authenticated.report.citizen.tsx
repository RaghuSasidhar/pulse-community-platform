import { useReportText } from "@/lib/report-translations";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { ReportFrame } from "@/components/report-frame";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { MY_AREA_ZONE_ID } from "@/data/zones";
import { useZones } from "@/lib/zones-context";
import { usePulse } from "@/lib/pulse-context";

export const Route = createFileRoute("/_authenticated/report/citizen")({
  head: () => ({
    meta: [
      { title: "Report your symptoms — Pulse" },
      {
        name: "description",
        content:
          "Tick the symptoms you have and set how severe each one feels. Your report is pseudonymous and counts only as part of an area pattern.",
      },
      { property: "og:title", content: "Report your symptoms — Pulse" },
      {
        property: "og:description",
        content: "A short, pseudonymous symptom report for your area.",
      },
    ],
  }),
  component: CitizenReport,
});

const symptoms = [
  "Cold",
  "Cough",
  "Fever (3 days or more)",
  "Body pains",
  "Stomach upset",
  "Headache",
  "Eye redness",
  "Skin rashes",
  "Vomiting",
  "Pneumonia",
];

const severityWords = ["Very mild", "Mild", "Noticeable", "Severe", "Very severe"];

function CitizenReport() {
  const tr = useReportText();
  const { addReport } = usePulse();
  const { getZone } = useZones();
  const navigate = useNavigate();
  const [zoneId, setZoneId] = useState(MY_AREA_ZONE_ID);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");

  const toggle = (symptom: string, checked: boolean) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (checked) next[symptom] = 3;
      else delete next[symptom];
      return next;
    });
  };

  const submit = () => {
    const entries = Object.entries(selected);
    if (!entries.length) {
      toast.error(tr("Select at least one symptom"));
      return;
    }
    const zone = getZone(zoneId);
    if (!zone) return;
    addReport({
      role: "citizen",
      zoneId,
      zoneName: zone.name,
      title: `${entries.length} symptom${entries.length > 1 ? "s" : ""} reported`,
      details: [
        ...entries.map(([s, v]) => `${s} — ${severityWords[v - 1]}`),
        ...(notes.trim() ? [`Note: ${notes.trim()}`] : []),
      ],
    });
    navigate({ to: "/report/submitted" });
  };

  return (
    <ReportFrame
      eyebrow={tr("Citizen report")}
      title={tr("What are you experiencing?")}
      description={tr("Tick everything that applies. A slider appears for each one so you can say how severe it feels. Nothing here is a diagnosis.")}
      zoneId={zoneId}
      onZoneChange={setZoneId}
      onSubmit={submit}
    >
      <div className="space-y-3">
        <Label>{tr("Symptoms")}</Label>
        <div className="grid gap-3 sm:grid-cols-2">
          {symptoms.map((s) => {
            const active = s in selected;
            return (
              <div
                key={s}
                className={`rounded-lg border p-4 transition-colors ${
                  active ? "border-primary/50 bg-secondary/50" : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={s}
                    checked={active}
                    onCheckedChange={(c) => toggle(s, c === true)}
                  />
                  <Label htmlFor={s} className="cursor-pointer text-sm font-normal">
                    {tr(s)}
                  </Label>
                </div>
                {active ? (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{tr("Severity")}</span>
                      <span className="numeral">
                        {tr(severityWords[(selected[s] ?? 3) - 1])}
                      </span>
                    </div>
                    <Slider
                      className="mt-3"
                      min={1}
                      max={5}
                      step={1}
                      value={[selected[s] ?? 3]}
                      onValueChange={([v]) =>
                        setSelected((prev) => ({ ...prev, [s]: v ?? 3 }))
                      }
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{tr("Anything else worth noting (optional)")}</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={tr("e.g. several neighbours have the same thing")}
        />
      </div>
    </ReportFrame>
  );
}
