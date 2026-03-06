"use client";

import Link from "next/link";
import { useState } from "react";
import "@/styles/vivid-portal.css";
import { VividTopbar } from "./VividTopbar";
import { VividFooter } from "./VividFooter";
import { FallbackImage } from "@/components/FallbackImage";
import { useLocale } from "@/lib/i18n/context";

type Game = { id: string; name: string; logoUrl: string | null; category?: string | null };

const CAT_KEYS = [
  { key: "slots",   icon: "🎰" },
  { key: "live",    icon: "📺" },
  { key: "sports",  icon: "⚽" },
  { key: "fishing", icon: "🎣" },
  { key: "lottery", icon: "🎱" },
  { key: "new",     icon: "✨" },
];

export function VividGamesClient({
  siteName = "KINGDOM888",
  games = [],
  loginUrl = "/login",
  registerUrl = "/register-wa",
}: {
  siteName?: string;
  games?: Game[];
  loginUrl?: string;
  registerUrl?: string;
}) {
  const { t } = useLocale();
  const [active, setActive] = useState("slots");

  const CATEGORIES = CAT_KEYS.map((c) => ({
    ...c,
    label: t(`public.vivid.games.${c.key}`),
  }));

  const filtered = games.filter((g) => (g.category ?? "").toLowerCase() === active);

  return (
    <div className="vp-shell">
      <VividTopbar siteName={siteName} loginUrl={loginUrl} registerUrl={registerUrl} />

      <div className="vp-w vp-main">
        {/* Breadcrumb */}
        <nav className="text-sm" style={{ color: "var(--vp-muted)" }}>
          <Link href="/" style={{ color: "var(--vp-muted)", textDecoration: "none" }}>{t("public.vivid.promo.breadcrumbHome")}</Link>
          <span className="mx-2">›</span>
          <span style={{ color: "var(--vp-text)" }}>{t("public.nav.games")}</span>
        </nav>

        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden shrink-0 md:block" style={{ width: 180 }}>
            <div className="vp-sidebar">
              {CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  className="vp-sidebar-item"
                  {...(active === c.key ? { "data-active": "" } : {})}
                  onClick={() => setActive(c.key)}
                  style={{ background: "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer" }}
                >
                  <span>{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">
            {/* Mobile category row */}
            <div className="flex gap-2 overflow-x-auto pb-1 md:hidden" style={{ scrollbarWidth: "none" }}>
              {CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  className="vp-btn"
                  onClick={() => setActive(c.key)}
                  style={{
                    whiteSpace: "nowrap",
                    height: 34,
                    fontSize: 13,
                    background: active === c.key ? "linear-gradient(135deg,var(--vp-accent),var(--vp-accent2))" : "var(--vp-card)",
                    border: "1px solid var(--vp-border)",
                    color: active === c.key ? "#fff" : "var(--vp-muted)",
                  }}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>

            <div className="vp-section-head">
              <h2 className="vp-section-title m-0">
                <span className="dot" />
                {CATEGORIES.find((c) => c.key === active)?.label ?? "Games"}
              </h2>
              <span className="text-sm" style={{ color: "var(--vp-muted)" }}>{filtered.length} {t("public.vivid.games.countLabel")}</span>
            </div>

            {filtered.length > 0 ? (
              <div className="vp-tile-grid">
                {filtered.map((g) => (
                  <Link key={g.id} href={`/games/play/${g.id}`} className="vp-tile">
                    <div className="thumb">
                      {g.logoUrl ? (
                        <FallbackImage src={g.logoUrl} alt={g.name} className="h-full w-full object-cover" />
                      ) : (
                        <span>🎮</span>
                      )}
                    </div>
                    <div className="label">{g.name}</div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="vp-card flex items-center justify-center py-16 text-center">
                <div>
                  <span className="text-5xl block mb-3">🎮</span>
                  <p className="m-0" style={{ color: "var(--vp-muted)" }}>{t("public.vivid.games.noGames")}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <VividFooter siteName={siteName} />
    </div>
  );
}
