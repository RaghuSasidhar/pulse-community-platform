import { useReportText } from "@/lib/report-translations";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { ReportFrame } from "@/components/report-frame";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MY_AREA_ZONE_ID } from "@/data/zones";
import { useZones } from "@/lib/zones-context";
import { usePulse } from "@/lib/pulse-context";

export const Route = createFileRoute("/_authenticated/report/lab")({
  head: () => ({
    meta: [
      { title: "Laboratory report — Pulse" },
      {
        name: "description",
        content:
          "Submit confirmatory pathogen panels, epidemic blood smears and culture results for an area.",
      },
      { property: "og:title", content: "Laboratory report — Pulse" },
      {
        property: "og:description",
        content: "Confirmatory results are the strongest corroboration a zone signal can get.",
      },
    ],
  }),
  component: LabReport,
});

const testTypes = [
  "Confirmatory pathogen panel",
  "Epidemic blood smear",
  "Bacterial culture",
  "Rapid antigen test",
  "Serology",
];

const pathogens = [
  "Influenza A",
  "Influenza B",
  "Dengue (NS1)",
  "Chikungunya",
  "Malaria (P. vivax)",
  "Malaria (P. falciparum)",
  "Cholera",
  "Typhoid (S. Typhi)",
  "Leptospira",
  "Other / unidentified",
];

function LabReport() {
  const tr = useReportText();
  const { addReport } = usePulse();
  const { getZone } = useZones();
  const navigate = useNavigate();
  const [zoneId, setZoneId] = useState(MY_AREA_ZONE_ID);
  const [testType, setTestType] = useState("Confirmatory pathogen panel");
  const [pathogen, setPathogen] = useState("Influenza A");
  const [tested, setTested] = useState("");
  const [positive, setPositive] = useState("");
  const [notes, setNotes] = useState("");

  const submit = () => {
    if (!positive.trim()) {
      toast.error(tr("Enter the number of positive results"));
      return;
    }
    const zone = getZone(zoneId);
    if (!zone) return;
    addReport({
      role: "lab",
      zoneId,
      zoneName: zone.name,
      title: `${pathogen} — ${testType}`,
      details: [
        `Test type: ${testType}`,
        `Pathogen: ${pathogen}`,
        `Samples tested: ${tested || "not stated"}`,
        `Positive results: ${positive}`,
        ...(notes.trim() ? [`Note: ${notes.trim()}`] : []),
      ],
    });
    navigate({ to: "/report/submitted" });
  };

  return (
    <ReportFrame
      eyebrow={tr("Laboratory report")}
      title={tr("Confirmatory results")}
      description={tr("Lab confirmation is weighted highest of all sources — it is what turns a suspected cluster into a corroborated one.")}
      zoneId={zoneId}
      onZoneChange={setZoneId}
      onSubmit={submit}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{tr("Test type")}</Label>
          <Select value={testType} onValueChange={setTestType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {testTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {tr(t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{tr("Pathogen / target")}</Label>
          <Select value={pathogen} onValueChange={setPathogen}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pathogens.map((p) => (
                <SelectItem key={p} value={p}>
                  {tr(p)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tested">{tr("Samples tested")}</Label>
          <Input
            id="tested"
            type="number"
            value={tested}
            onChange={(e) => setTested(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="positive">{tr("Positive results")}</Label>
          <Input
            id="positive"
            type="number"
            value={positive}
            onChange={(e) => setPositive(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="lab-notes">{tr("Laboratory note (optional)")}</Label>
        <Textarea
          id="lab-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={tr("Sample collection window, resistance findings, anything unusual")}
        />
      </div>
    </ReportFrame>
  );
}
