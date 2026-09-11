import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { Zone } from "@/data/zones";
import { listZones } from "@/lib/pulse-data.functions";

export const zonesQueryOptions = queryOptions({
  queryKey: ["zones"],
  queryFn: () => listZones(),
  staleTime: 30 * 1000,
});

type ZonesValue = {
  zones: Zone[];
  getZone: (id: string) => Zone | undefined;
};

const ZonesContext = createContext<ZonesValue | null>(null);

export function ZonesProvider({ children }: { children: ReactNode }) {
  const { data } = useSuspenseQuery(zonesQueryOptions);

  const value = useMemo<ZonesValue>(
    () => ({
      zones: data,
      getZone: (id: string) => data.find((z) => z.id === id),
    }),
    [data],
  );

  return <ZonesContext.Provider value={value}>{children}</ZonesContext.Provider>;
}

export function useZones() {
  const ctx = useContext(ZonesContext);
  if (!ctx) throw new Error("useZones must be used inside ZonesProvider");
  return ctx;
}
