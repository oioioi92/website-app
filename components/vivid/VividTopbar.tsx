"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/types";

const NAV = [
  { label: "Home",      href: "/" },
  { label: "Games",     href: "/games" },
  { label: "Promotion", href: "/promotion" },
  { label: "Bonus",     href: "/bonus" },
  { label: "Support",   href: "/chat" },
];

const LANGS: Array<{ code: string; label: string; locale: Locale }> = [
  { code: "EN", label: "English",       locale: "en" },
  { code: "ZH", label: "华语",          locale: "zh" },
  { code: "MY", label: "Bahasa Melayu", locale: "ms" },
];

export function VividTopbar({ siteName = "KINGDOM888", logoUrl = null, loginUrl = "/login", registerUrl = "/register-wa" }: {
  siteName?: string;
  logoUrl?: string | null;
  loginUrl?: string;
  registerUrl?: string;
}) {
  const path = usePathname();
  const { locale, setLocale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Map locale → display code
  const activeLang = LANGS.find((l) => l.locale === locale)?.code ?? "EN";

  // Translated nav items (computed inside component so t() re-runs on locale change)
  const NAV_ITEMS = [
    { label: t("public.nav.home"),      href: "/" },
    { label: t("public.nav.games"),     href: "/games" },
    { label: t("public.nav.promotion"), href: "/promotion" },
    { label: t("public.nav.history"),   href: "/history" },
    { label: t("public.nav.support"),   href: "/chat" },
  ];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="vp-bar">
      <div className="vp-w vp-bar-inner">
        <Link href="/" className="vp-logo" style={{ display: "flex", alignItems: "center" }}>
          {logoUrl
            ? <Image src={logoUrl} alt={siteName} width={140} height={40} style={{ height: 40, width: "auto", objectFit: "contain" }} unoptimized />
            : siteName
          }
        </Link>
        <nav className="vp-nav">
          {NAV_ITEMS.map((n) => (
            <Link key={n.href} href={n.href} {...(path === n.href ? { "data-active": "" } : {})}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="vp-bar-actions">
          {/* Language selector — connected to real i18n */}
          <div ref={ref} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="vp-btn vp-btn-outline"
              style={{ gap: 6, minWidth: 72 }}
            >
              <span style={{ fontSize: 13 }}>🌐</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{activeLang}</span>
              <span style={{ fontSize: 10, opacity: 0.6 }}>▾</span>
            </button>

            {open && (
              <div style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                minWidth: 160,
                background: "var(--vp-card)",
                border: "1px solid var(--vp-border)",
                borderRadius: 12,
                padding: "6px",
                zIndex: 100,
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              }}>
                {LANGS.map((l) => {
                  const isActive = locale === l.locale;
                  return (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => { setLocale(l.locale); setOpen(false); }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        padding: "9px 14px",
                        borderRadius: 8,
                        border: "none",
                        background: isActive ? "rgba(176,96,255,0.22)" : "transparent",
                        color: isActive ? "#d4a0ff" : "rgba(255,255,255,0.65)",
                        fontSize: 14,
                        fontWeight: isActive ? 700 : 500,
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--vp-card2)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = isActive ? "rgba(176,96,255,0.22)" : "transparent"; }}
                    >
                      <span>{l.label}</span>
                      <span style={{ fontSize: 12, opacity: 0.5 }}>{l.code}</span>
                      {isActive && <span style={{ marginLeft: 6, color: "#b060ff" }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <Link href={loginUrl} className="vp-btn vp-btn-outline">{t("public.actions.login")}</Link>
          <Link href={registerUrl} className="vp-btn vp-btn-primary">{t("public.actions.register")}</Link>
        </div>
      </div>
    </div>
  );
}
