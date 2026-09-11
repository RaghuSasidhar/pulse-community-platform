import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { ReportFrame } from "@/components/report-frame";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MY_AREA_ZONE_ID } from "@/data/zones";
import { useZones } from "@/lib/zones-context";
import { usePulse } from "@/lib/pulse-context";

export const Route = createFileRoute("/_authenticated/report/volunteer")({
  head: () => ({
    meta: [
      { title: "Community report — Pulse for volunteers" },
      {
        name: "description",
        content:
          "ASHA and community workers report household tallies, surge alerts, rumours and stock logs for their area.",
      },
      { property: "og:title", content: "Community report — Pulse for volunteers" },
      {
        property: "og:description",
        content: "Household-level signals and informal alerts from the field.",
      },
    ],
  }),
  component: VolunteerReport,
});

const alerts = [
  "Unusual number of households with fever",
  "Unusual number of households with diarrhoea",
  "Community rumour of a new illness",
  "Unexplained animal deaths nearby",
  "School or workplace absences spiking",
  "Unusual illness with no obvious cause",
];

const counts = [
  { key: "Households with active fever", label: "Households with active fever" },
  { key: "Households with diarrhoea", label: "Households with diarrhoea" },
  { key: "Daily OPD/PHC census", label: "Daily OPD or PHC census" },
  { key: "ORS packets in stock", label: "ORS packets in stock" },
  { key: "Paracetamol strips in stock", label: "Paracetamol strips in stock" },
];

function VolunteerReport() {
  const { addReport } = usePulse();
  const { getZone } = useZones();
  const navigate = useNavigate();
  const [zoneId, setZoneId] = useState(MY_AREA_ZONE_ID);
  const [checked, setChecked] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");

  const submit = () => {
    const filled = counts
      .filter((c) => (values[c.key] ?? "").trim() !== "")
      .map((c) => `${c.key}: ${values[c.key]}`);
    if (!checked.length && !filled.length) {
      toast.error("Add at least one alert or count");
      return;
    }
    const zone = getZone(zoneId)!;
    addReport({
      role: "volunteer",
      zoneId,
      zoneName: zone.name,
      title: "Community / household report",
      details: [
        ...checked.map((c) => `Alert: ${c}`),
        ...filled,
        ...(notes.trim() ? [`Note: ${notes.trim()}`] : []),
      ],
    });
    navigate({ to: "/report/submitted" });
  };

  return (
    <ReportFrame
      eyebrow="Volunteer report"
      title="What is your community seeing?"
      description="Informal alerts and household tallies together give the earliest warning of a cluster forming, often before anyone visits a clinic."
      zoneId={zoneId}
      onZoneChange={setZoneId}
      onSubmit={submit}
    >
      <div className="space-y-3">
        <Label>Surge alerts and rumours</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {alerts.map((a) => (
            <label
              key={a}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 text-sm"
            >
              <Checkbox
                checked={checked.includes(a)}
                onCheckedChange={(c) =>
                  setChecked((prev) =>
                    c === true ? [...prev, a] : prev.filter((x) => x !== a),
                  )
                }
              />
              {a}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Case-based counts (S-Form)</Label>
        <div className="grid gap-4 sm:grid-cols-2">
          {counts.map((c) => (
            <div key={c.key} className="space-y-2">
              <Label htmlFor={c.key} className="text-sm font-normal text-muted-foreground">
                {c.label}
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

      <div className="space-y-2">
        <Label htmlFor="vol-notes">Field note (optional)</Label>
        <Textarea
          id="vol-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What people in the area are saying"
        />
      </div>
    </ReportFrame>
  );
}
