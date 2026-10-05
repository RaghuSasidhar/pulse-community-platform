import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { usePulse } from "@/lib/pulse-context";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="border-b border-border/70 bg-nightfall text-primary-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
        {eyebrow ? (
          <p className="numeral text-xs uppercase tracking-[0.2em] opacity-70">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm opacity-80 sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function Disclaimer() {
  const { t } = usePulse();
  return (
    <p className="rounded-lg border border-border bg-secondary/60 p-3 text-xs text-muted-foreground">
      {t("disclaimer")}
    </p>
  );
}
