import { useReportText } from "@/lib/report-translations";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { ReportFrame } from "@/components/report-frame";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MY_AREA_ZONE_ID } from "@/data/zones";
import { useZones } from "@/lib/zones-context";
import { usePulse } from "@/lib/pulse-context";

export const Route = createFileRoute("/_authenticated/report/doctor")({
  head: () => ({
    meta: [
      { title: "Clinical report — Pulse for doctors" },
      {
        name: "description",
        content:
          "Submit presumptive cases, syndromic counts, inpatient census, OPD triage or notifiable disease reports for your area.",
      },
      { property: "og:title", content: "Clinical report — Pulse for doctors" },
      {
        property: "og:description",
        content: "Structured clinical reporting across GP, hospital, OPD and private practice.",
      },
    ],
  }),
  component: DoctorReport,
});

type FieldSpec = { key: string; label: string; placeholder?: string; type?: "number" | "text" };

const subtypes: {
  id: string;
  label: string;
  blurb: string;
  fields: FieldSpec[];
}[] = [
  {
    id: "gp",
    label: "General practitioner",
    blurb: "Presumptive infectious cases (P-Form), syndromic counts (S-Form) and vaccination events.",
    fields: [
      { key: "Presumptive cases seen today", label: "Presumptive infectious cases", type: "number" },
      { key: "Presumptive condition", label: "Presumptive condition", placeholder: "e.g. influenza-like illness" },
      { key: "Fever syndromic count", label: "Fever syndromic count", type: "number" },
      { key: "Diarrhoea syndromic count", label: "Diarrhoea syndromic count", type: "number" },
      { key: "Vaccination events", label: "Vaccination events administered", type: "number" },
    ],
  },
  {
    id: "hospital",
    label: "Hospital backend",
    blurb: "Inpatient admissions, ICU census, pathogen cultures, bed occupancy and mortality.",
    fields: [
      { key: "IPD admissions (24h)", label: "Inpatient admissions (24h)", type: "number" },
      { key: "ICU census", label: "ICU census", type: "number" },
      { key: "Bed occupancy %", label: "Bed occupancy (%)", type: "number" },
      { key: "Positive cultures logged", label: "Positive pathogen cultures logged", type: "number" },
      { key: "Deaths (24h)", label: "Deaths in last 24h", type: "number" },
    ],
  },
  {
    id: "opd",
    label: "OPD",
    blurb: "Daily triage counts, symptom clusters and syndromic trend direction.",
    fields: [
      { key: "Patients triaged today", label: "Patients triaged today", type: "number" },
      { key: "Respiratory presentations", label: "Respiratory presentations", type: "number" },
      { key: "GI presentations", label: "Gastrointestinal presentations", type: "number" },
      { key: "Rash / fever presentations", label: "Rash or fever presentations", type: "number" },
      { key: "Dominant cluster", label: "Dominant symptom cluster", placeholder: "e.g. fever with eye redness" },
    ],
  },
  {
    id: "private",
    label: "Private practice",
    blurb: "Statutory notifiable diseases and targeted condition trends.",
    fields: [
      { key: "Notifiable disease", label: "Notifiable disease observed", placeholder: "e.g. dengue" },
      { key: "Cases this week", label: "Cases this week", type: "number" },
      { key: "Paediatric wheezing cases", label: "Paediatric wheezing cases", type: "number" },
      { key: "Skin-rash presentations", label: "Skin-rash presentations", type: "number" },
    ],
  },
];

function DoctorReport() {
  const tr = useReportText();
  const { addReport } = usePulse();
  const { getZone } = useZones();
  const navigate = useNavigate();
  const [zoneId, setZoneId] = useState(MY_AREA_ZONE_ID);
  const [subtype, setSubtype] = useState("gp");
  const [values, setValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");

  const active = subtypes.find((s) => s.id === subtype);

  const submit = () => {
    if (!active) return;
    const filled = active.fields
      .filter((f) => (values[`${active.id}:${f.key}`] ?? "").trim() !== "")
      .map((f) => `${f.key}: ${values[`${active.id}:${f.key}`]}`);
    if (!filled.length) {
      toast.error(tr("Fill at least one field"));
      return;
    }
    const zone = getZone(zoneId);
    if (!zone) return;
    addReport({
      role: "doctor",
      zoneId,
      zoneName: zone.name,
      title: `${active.label} clinical report`,
      details: [...filled, ...(notes.trim() ? [`Note: ${notes.trim()}`] : [])],
    });
    navigate({ to: "/report/submitted" });
  };

  return (
    <ReportFrame
      eyebrow={tr("Doctor report")}
      title={tr("Clinical reporting")}
      description={tr("Pick the setting you are reporting from. Clinical reports carry more weight in the severity calculation than citizen self-reports.")}
      zoneId={zoneId}
      onZoneChange={setZoneId}
      onSubmit={submit}
    >
      <Tabs value={subtype} onValueChange={setSubtype}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start">
          {subtypes.map((s) => (
            <TabsTrigger key={s.id} value={s.id}>
              {tr(s.label)}
            </TabsTrigger>
          ))}
        </TabsList>
        {subtypes.map((s) => (
          <TabsContent key={s.id} value={s.id} className="space-y-5 pt-5">
            <p className="text-sm text-muted-foreground">{tr(s.blurb)}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {s.fields.map((f) => (
                <div key={f.key} className="space-y-2">
                  <Label htmlFor={`${s.id}:${f.key}`}>{tr(f.label)}</Label>
                  <Input
                    id={`${s.id}:${f.key}`}
                    type={f.type === "number" ? "number" : "text"}
                    placeholder={f.placeholder ? tr(f.placeholder) : undefined}
                    value={values[`${s.id}:${f.key}`] ?? ""}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        [`${s.id}:${f.key}`]: e.target.value,
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="space-y-2">
        <Label htmlFor="doctor-notes">{tr("Clinical note (optional)")}</Label>
        <Textarea
          id="doctor-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={tr("Anything unusual about presentation, timing or geography")}
        />
      </div>
    </ReportFrame>
  );
}
