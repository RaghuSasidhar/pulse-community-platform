import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

import { severityFromScore, type Zone } from "@/data/zones";

type ZoneRow = {
  id: string;
  name: string;
  district: string;
  lat: number;
  lng: number;
  population: number;
  severity_score: number;
  trend: string;
  trend_pct: number;
  top_signals: { label: string; count: number }[] | null;
  sources: Record<string, number> | null;
  summary: string;
  possible_reason: string;
  precautions: string[] | null;
  weekly: number[] | null;
  publicly_visible: boolean;
  anomaly_flag: string | null;
};

function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

function toZone(row: ZoneRow): Zone {
  const sources = row.sources ?? {};
  return {
    id: row.id,
    name: row.name,
    district: row.district,
    lat: row.lat,
    lng: row.lng,
    population: row.population,
    severityScore: row.severity_score,
    severity: severityFromScore(row.severity_score),
    trend: (row.trend as Zone["trend"]) ?? "steady",
    trendPct: row.trend_pct,
    topSignals: row.top_signals ?? [],
    sources: {
      citizen: sources["citizen"] ?? 0,
      doctor: sources["doctor"] ?? 0,
      volunteer: sources["volunteer"] ?? 0,
      lab: sources["lab"] ?? 0,
      pharmacy: sources["pharmacy"] ?? 0,
    },
    summary: row.summary,
    possibleReason: row.possible_reason,
    precautions: row.precautions ?? [],
    weekly: row.weekly ?? [0, 0, 0, 0, 0, 0, 0],
    publiclyVisible: row.publicly_visible,
    ...(row.anomaly_flag ? { anomalyFlag: row.anomaly_flag } : {}),
  };
}

/** All monitored areas, straight from the database. Public data. */
export const listZones = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("zones")
    .select(
      "id,name,district,lat,lng,population,severity_score,trend,trend_pct,top_signals,sources,summary,possible_reason,precautions,weekly,publicly_visible,anomaly_flag",
    )
    .order("severity_score", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as ZoneRow[]).map(toZone);
});

export type StoredReport = {
  id: string;
  zoneId: string;
  role: string;
  title: string;
  details: string[];
  createdAt: string;
};

/** Recent reports for an area, newest first. */
export const listZoneReports = createServerFn({ method: "GET" })
  .inputValidator((input: { zoneId: string; limit?: number }) => input)
  .handler(async ({ data }) => {
    const { data: rows, error } = await publicClient()
      .from("reports")
      .select("id,zone_id,role,title,details,created_at")
      .eq("zone_id", data.zoneId)
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 25);

    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => ({
      id: r.id as string,
      zoneId: r.zone_id as string,
      role: r.role as string,
      title: r.title as string,
      details: (r.details ?? []) as string[],
      createdAt: r.created_at as string,
    })) satisfies StoredReport[];
  });

/** Save a report. Nudges the area's severity through a database trigger. */
export const submitReport = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      zoneId: string;
      role: string;
      title: string;
      details: string[];
      sessionId?: string;
    }) => {
      if (!input.zoneId || !input.role || !input.title) {
        throw new Error("Missing report fields");
      }
      return {
        zoneId: input.zoneId,
        role: input.role,
        title: input.title.slice(0, 200),
        details: (input.details ?? []).slice(0, 40).map((d) => String(d).slice(0, 300)),
        sessionId: input.sessionId ?? null,
      };
    },
  )
  .handler(async ({ data }) => {
    const { data: row, error } = await publicClient()
      .from("reports")
      .insert({
        zone_id: data.zoneId,
        role: data.role,
        title: data.title,
        details: data.details,
        session_id: data.sessionId,
      })
      .select("id,created_at")
      .single();

    if (error) throw new Error(error.message);
    return { id: row.id as string, createdAt: row.created_at as string };
  });
