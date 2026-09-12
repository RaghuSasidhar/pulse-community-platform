import { useCallback, useEffect, useRef, useState } from "react";

export type LocationStatus =
  | "idle"
  | "unsupported"
  | "asking"
  | "granted"
  | "denied"
  | "error";

export type Coords = { lat: number; lng: number };

const CACHE_KEY = "pulse.location";

function readCache(): Coords | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Coords) : null;
  } catch {
    return null;
  }
}

/**
 * Asks the browser for the visitor's location once on load (when they have
 * already granted it, or automatically on first visit) and caches it for the
 * session.
 */
export function useMyLocation() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [status, setStatus] = useState<LocationStatus>("idle");
  const requested = useRef(false);

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unsupported");
      return;
    }
    setStatus("asking");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setCoords(next);
        setStatus("granted");
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
      },
      (err) => {
        setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  }, []);

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;

    const cached = readCache();
    if (cached) {
      setCoords(cached);
      setStatus("granted");
      return;
    }
    request();
  }, [request]);

  return { coords, status, request };
}
