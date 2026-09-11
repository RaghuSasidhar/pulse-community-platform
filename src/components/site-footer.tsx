import { Link } from "@tanstack/react-router";

import { usePulse } from "@/lib/pulse-context";

export function SiteFooter() {
  const { t } = usePulse();
  return (
    <footer className="mt-16 border-t border-border/70 bg-nightfall text-primary-foreground">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="text-lg font-semibold">Pulse</p>
          <p className="mt-2 max-w-xs text-sm opacity-75">{t("disclaimer")}</p>
        </div>
        <div className="text-sm">
          <p className="font-medium">Explore</p>
          <ul className="mt-3 space-y-2 opacity-75">
            <li>
              <Link to="/">Dashboard</Link>
            </li>
            <li>
              <Link to="/officials">Officials console</Link>
            </li>
            <li>
              <Link to="/auth">Report a signal</Link>
            </li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-medium">Understand</p>
          <ul className="mt-3 space-y-2 opacity-75">
            <li>
              <Link to="/about">About Pulse</Link>
            </li>
            <li>
              <Link to="/privacy">Privacy &amp; data use</Link>
            </li>
            <li>
              <Link to="/faq">FAQ</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-4 text-xs opacity-60 sm:px-6">
          Demo build — sample data, simulated sign-in, no real health records.
        </p>
      </div>
    </footer>
  );
}
