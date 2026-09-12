import L from "leaflet";
import "leaflet.heat";
import { useEffect, useRef } from "react";

import type { Zone } from "@/data/zones";

// Deterministic pseudo-random so server/client and reloads agree.
function makeRng(seed: number) {
  let s = seed || 1;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/** Scatter a cloud of weighted points around a zone centre. */
function scatter(zone: Zone, seed: number) {
  const rng = makeRng(seed);
  const count = 60 + Math.round(zone.severityScore * 3.2);
  const spread = 0.018 + (zone.severityScore / 100) * 0.022;
  const points: [number, number, number][] = [];
  for (let i = 0; i < count; i += 1) {
    // Gaussian-ish falloff: dense at the centre, sparse at the fringe.
    const r = (rng() + rng() + rng()) / 3;
    const angle = rng() * Math.PI * 2;
    const dist = Math.pow(r, 1.6) * spread;
    points.push([
      zone.lat + Math.sin(angle) * dist,
      zone.lng + Math.cos(angle) * dist * 1.25,
      Math.max(0.05, (zone.severityScore / 100) * 0.5 * (1 - r * 0.75)),
    ]);
  }
  return points;
}

const TIER_COLOR: Record<Zone["severity"], string> = {
  low: "#16a34a",
  moderate: "#eab308",
  high: "#f97316",
  critical: "#dc2626",
};

const TIER_LABEL: Record<Zone["severity"], string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
  critical: "Critical",
};

/** Colour-coded badge showing the area name, tier and report count. */
function zoneBadge(zone: Zone) {
  const total = zone.severityScore * 4 + 12;
  const color = TIER_COLOR[zone.severity];
  return L.divIcon({
    className: "pulse-zone-badge",
    html: `<span style="
      display:inline-flex;align-items:center;gap:6px;white-space:nowrap;
      padding:3px 8px;border-radius:9999px;
      background:${color};color:#fff;
      font:600 11px ui-sans-serif,system-ui;
      border:2px solid rgba(255,255,255,.9);
      box-shadow:0 2px 10px rgba(11,23,61,.35);
      transform:translate(-50%,-50%);
    ">${zone.name} · ${TIER_LABEL[zone.severity]} · ${total}</span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function userIcon() {
  return L.divIcon({
    className: "pulse-user-dot",
    html: `<span style="
      display:block;width:16px;height:16px;border-radius:9999px;
      background:#1e42ac;border:3px solid #fff;
      box-shadow:0 0 0 6px rgba(30,66,172,.25);
    "></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

type Props = {
  zones: Zone[];
  center?: [number, number];
  focusZoneId?: string | null;
  onSelectZone?: (zoneId: string) => void;
  userPosition?: [number, number];
  height?: string;
};

export default function ZoneMap({
  zones,
  center = [16.5, 80.65],
  focusZoneId = null,
  onSelectZone,
  userPosition,
  height = "480px",
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const selectRef = useRef(onSelectZone);
  selectRef.current = onSelectZone;
  const zonesRef = useRef(zones);
  zonesRef.current = zones;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center,
      zoom: 11,
      scrollWheelZoom: false,
      attributionControl: true,
    });
    mapRef.current = map;

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
      opacity: 0.9,
    }).addTo(map);

    const visible = zones.filter((z) => z.publiclyVisible);

    const heatPoints = visible.flatMap((z, i) => scatter(z, i * 7919 + 13));

    // leaflet.heat augments L at runtime
    (L as unknown as { heatLayer: (p: unknown, o: unknown) => L.Layer }).heatLayer(
      heatPoints,
      {
        radius: 20,
        blur: 18,
        max: 1.0,
        minOpacity: 0.3,
        maxZoom: 12,
        gradient: {
          0.0: "#2b6cff",
          0.25: "#31d2f2",
          0.45: "#3ddc4a",
          0.62: "#e8e337",
          0.78: "#f79626",
          1.0: "#e2231a",
        },
      },
    ).addTo(map);

    visible.forEach((z) => {
      const marker = L.marker([z.lat, z.lng], { icon: countBubble(z) }).addTo(map);
      marker.bindTooltip(`${z.name} — ${z.severity} (${z.severityScore})`, {
        direction: "top",
      });
      marker.on("click", () => selectRef.current?.(z.id));
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current || !focusZoneId) return;
    const zone = zonesRef.current.find((z) => z.id === focusZoneId);
    if (zone) mapRef.current.flyTo([zone.lat, zone.lng], 13, { duration: 0.8 });
  }, [focusZoneId]);

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className="w-full overflow-hidden rounded-xl border border-border"
    />
  );
}
