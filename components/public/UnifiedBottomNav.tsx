"use client";

/**
 * 唯一底部导航：固定 6 项，顺序 Home → Games → Promo → History → Live Chat → Setting。
 * 全站只使用此组件，不依赖 theme/featureFlag，从根源杜绝只显示 5 项。
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n/context";

const ITEMS = [
  { href: "/", labelKey: "public.vivid.bottomNav.home" as const, emoji: "🏠" },
  { href: "/games", labelKey: "public.vivid.bottomNav.games" as const, emoji: "🎮" },
  { href: "/promotion", labelKey: "public.vivid.bottomNav.promo" as const, emoji: "🎁" },
  { href: "/history", labelKey: "public.vivid.bottomNav.history" as const, emoji: "📜" },
  { href: "/chat", labelKey: "public.vivid.bottomNav.liveChat" as const, emoji: "💬" },
  { href: "/settings", labelKey: "public.vivid.bottomNav.setting" as const, emoji: "⚙️" },
] as const;

type Variant = "vivid" | "default";

export function UnifiedBottomNav({ variant = "default" }: { variant?: Variant }) {
  const path = usePathname();
  const { t } = useLocale();
  const isVivid = variant === "vivid";

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
        const active = path === n.href || (n.href !== "/" && path.startsWith(n.href));
        const label = n.href === "/chat" ? "Live Chat" : (t(n.labelKey) || n.labelKey.split(".").pop());
        return (
          <Link
            key={n.href}
            href={n.href}
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
                ? { color: active ? "#a855f7" : "rgba(157,149,201,0.75)" }
                : { color: active ? "var(--p44-green-dark)" : "rgba(255,255,255,0.7)" }),
            }}
          >
            <span style={{ fontSize: 18 }} aria-hidden>{n.emoji}</span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>{label}</span>
            {isVivid && active && (
              <span
                style={{
                  width: 20,
                  height: 2,
                  borderRadius: 1,
                  background: "linear-gradient(90deg,#a855f7,#6366f1)",
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
