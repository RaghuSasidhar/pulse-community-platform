import L from "leaflet";
import "leaflet.heat";
import { useEffect, useRef } from "react";

import { zones, type Zone } from "@/data/zones";

const severityColor: Record<Zone["severity"], string> = {
  low: "#CDD6EE",
  moderate: "#D6CDEE",
  high: "#E6CDEE",
  critical: "#1E42AC",
};

type Props = {
  center?: [number, number];
  focusZoneId?: string | null;
  onSelectZone?: (zoneId: string) => void;
  height?: string;
};

export default function ZoneMap({
  center = [19.22, 73.1],
  focusZoneId = null,
  onSelectZone,
  height = "480px",
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const selectRef = useRef(onSelectZone);
  selectRef.current = onSelectZone;

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
      opacity: 0.85,
    }).addTo(map);

    const visible = zones.filter((z) => z.publiclyVisible);

    const heatPoints = visible.map(
      (z) => [z.lat, z.lng, z.severityScore / 100] as [number, number, number],
    );
    // leaflet.heat augments L at runtime
    (L as unknown as { heatLayer: (p: unknown, o: unknown) => L.Layer }).heatLayer(
      heatPoints,
      {
        radius: 55,
        blur: 38,
        minOpacity: 0.45,
        maxZoom: 13,
        gradient: {
          0.2: "#CDD6EE",
          0.45: "#D6CDEE",
          0.65: "#E6CDEE",
          0.85: "#1E42AC",
          1.0: "#0B173D",
        },
      },
    ).addTo(map);

    visible.forEach((z) => {
      const marker = L.circleMarker([z.lat, z.lng], {
        radius: 9,
        color: "#0B173D",
        weight: 1.5,
        fillColor: severityColor[z.severity],
        fillOpacity: 0.95,
      }).addTo(map);
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
    const zone = zones.find((z) => z.id === focusZoneId);
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
