import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

import { Disclaimer, PageHeader, PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useZones } from "@/lib/zones-context";

export function ReportFrame({
  eyebrow,
  title,
  description,
  zoneId,
  onZoneChange,
  onSubmit,
  submitLabel = "Submit report",
  children,
  aside,
}: {
  eyebrow: string;
  title: string;
  description: string;
  zoneId: string;
  onZoneChange: (id: string) => void;
  onSubmit: () => void;
  submitLabel?: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  const { zones } = useZones();
  return (
    <PageShell>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-10 sm:px-6">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground">
          <ArrowLeft className="mr-1.5 size-4" /> Back to map
        </Link>

        <Card>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
              <Label>Area this report covers</Label>
              <Select value={zoneId} onValueChange={onZoneChange}>
                <SelectTrigger className="w-full sm:w-80">
                  <SelectValue placeholder="Select an area" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((z) => (
                    <SelectItem key={z.id} value={z.id}>
                      {z.name} · {z.district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Reports are recorded against an area, never a precise address.
              </p>
            </div>

            {children}

            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
              <Button onClick={onSubmit} size="lg">
                {submitLabel}
              </Button>
              <span className="text-xs text-muted-foreground">
                Demo submission — stored in this browser session only.
              </span>
            </div>
          </CardContent>
        </Card>

        {aside}
        <Disclaimer />
      </div>
    </PageShell>
  );
}
