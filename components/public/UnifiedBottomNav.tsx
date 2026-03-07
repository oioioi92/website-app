"use client";

/**
 * 唯一底部导航：固定 6 项，顺序 Home → Games → Promo → History → Live Chat → Setting。
 * 若传入 theme 且 theme.bottomNav 有 iconUrl，则用照片代替 emoji。
 * 未登入用户点击 History / Setting 会跳转到登录页。
 */
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n/context";
import { FallbackImage } from "@/components/FallbackImage";
import type { ThemeConfig } from "@/lib/public/theme";

const ITEMS = [
  { href: "/", labelKey: "public.vivid.bottomNav.home" as const, emoji: "🏠" },
  { href: "/games", labelKey: "public.vivid.bottomNav.games" as const, emoji: "🎮" },
  { href: "/promotion", labelKey: "public.vivid.bottomNav.promo" as const, emoji: "🎁" },
  { href: "/history", labelKey: "public.vivid.bottomNav.history" as const, emoji: "📜" },
  { href: "/chat", labelKey: "public.vivid.bottomNav.liveChat" as const, emoji: "💬" },
  { href: "/settings", labelKey: "public.vivid.bottomNav.setting" as const, emoji: "⚙️" },
] as const;

type Variant = "vivid" | "default";

function normHref(h: string) {
  return (h ?? "").toLowerCase().replace(/\/$/, "") || "/";
}

export function UnifiedBottomNav({ theme, variant = "default" }: { theme?: ThemeConfig; variant?: Variant }) {
  const path = usePathname();
  const { t } = useLocale();
  const isVivid = variant === "vivid";
  const themeNav = theme?.bottomNav ?? [];
  const [hasMember, setHasMember] = useState<boolean | null>(null);
  const loginUrl = (theme?.loginUrl?.trim() && theme.loginUrl.startsWith("/") ? theme.loginUrl : "/login").split("?")[0];

  useEffect(() => {
    fetch("/api/public/member/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setHasMember(!!d?.member))
      .catch(() => setHasMember(false));
  }, []);

  return (
    <nav
      role="navigation"
      aria-label="Bottom navigation"
      data-bottom-nav-items="6"
      data-has-live-chat="true"
      data-unified-bottom-nav="true"
      data-from-layout="true"
      className={isVivid ? "" : "border-t border-[color:var(--p44-grey-light)]/30 bg-[color:var(--p44-header-bg)]/98 backdrop-blur"}
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: "grid",
        gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
        paddingBottom: "env(safe-area-inset-bottom, 4px)",
        ...(isVivid
          ? {
              minHeight: 64,
              background: "rgba(13,13,26,0.97)",
              borderTop: "1px solid rgba(120,80,255,0.3)",
              backdropFilter: "blur(12px)",
            }
          : {
              borderTop: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(42,45,54,0.98)",
              backdropFilter: "blur(8px)",
            }),
      }}
    >
      {ITEMS.map((n) => {
        const isProtected = n.href === "/history" || n.href === "/settings";
        const effectiveHref = isProtected && hasMember === false ? `${loginUrl}?returnUrl=${encodeURIComponent(n.href)}` : n.href;
        const themeItem = themeNav.find((x) => normHref(x.href) === normHref(n.href));
        const iconUrl = themeItem?.iconUrl ?? null;
        const label = themeItem?.label?.trim() || (n.href === "/chat" ? "Live Chat" : (t(n.labelKey) || n.labelKey.split(".").pop()));
        const active = path === n.href || (n.href !== "/" && path.startsWith(n.href));
        return (
          <Link
            key={n.href}
            href={effectiveHref}
            aria-label={label}
            data-nav-item={n.href === "/chat" ? "live-chat" : undefined}
            className={isVivid ? "" : "flex min-h-[44px] flex-col items-center justify-center rounded-xl border border-transparent text-[9px] font-bold tracking-wide transition"}
            style={{
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              padding: "10px 2px 8px",
              textDecoration: "none",
              fontSize: 10,
              fontWeight: active ? 700 : 500,
              ...(isVivid
                ? { color: active ? "var(--vp-accent)" : "rgba(157,149,201,0.75)" }
                : { color: active ? "var(--p44-green-dark)" : "rgba(255,255,255,0.7)" }),
            }}
          >
            {iconUrl ? (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center" aria-hidden>
                <FallbackImage src={iconUrl} alt="" className="h-full w-full object-contain" />
              </span>
            ) : (
              <span style={{ fontSize: 20 }} aria-hidden>{n.emoji}</span>
            )}
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>{label}</span>
            {isVivid && active && (
              <span
                style={{
                  width: 20,
                  height: 2,
                  borderRadius: 1,
                  background: "linear-gradient(90deg,var(--vp-accent),var(--vp-accent2))",
                  marginTop: 1,
                }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
