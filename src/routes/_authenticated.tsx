import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { usePulse } from "@/lib/pulse-context";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { hydrated, session } = usePulse();
  const navigate = useNavigate();

  useEffect(() => {
    if (hydrated && !session) navigate({ to: "/auth", replace: true });
  }, [hydrated, session, navigate]);

  if (!hydrated || !session) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-4 p-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return <Outlet />;
}
