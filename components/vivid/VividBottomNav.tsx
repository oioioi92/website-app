"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n/context";

/** 底部固定 6 项：Home, Games, Promo, History, Live Chat, Setting。一律用 emoji 避免图标解析成 “N” 等歧义。 */
const BOTTOM_NAV_CONFIG = [
  { labelKey: "public.vivid.bottomNav.home", href: "/", emoji: "🏠" },
  { labelKey: "public.vivid.bottomNav.games", href: "/games", emoji: "🎮" },
  { labelKey: "public.vivid.bottomNav.promo", href: "/promotion", emoji: "🎁" },
  { labelKey: "public.vivid.bottomNav.history", href: "/history", emoji: "📜" },
  { labelKey: "public.vivid.bottomNav.liveChat", href: "/chat", emoji: "💬" },
  { labelKey: "public.vivid.bottomNav.setting", href: "/settings", emoji: "⚙️" },
] as const;

/** Vivid 底部固定导航：固定 6 列，Home / Games / Promo / History / Live Chat / Setting，防止被挤掉或只显示 5 项。 */
export function VividBottomNav() {
  const path = usePathname();
  const { t } = useLocale();
  return (
    <nav
      role="navigation"
      aria-label="Bottom navigation"
      data-bottom-nav-items="6"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "rgba(13,13,26,0.97)",
        borderTop: "1px solid rgba(120,80,255,0.3)",
        backdropFilter: "blur(12px)",
        display: "grid",
        gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
        paddingBottom: "env(safe-area-inset-bottom, 4px)",
      }}
    >
      {BOTTOM_NAV_CONFIG.map((n) => {
        const active = path === n.href;
        const isLiveChat = n.href === "/chat";
        const label = isLiveChat ? (t(n.labelKey) || "Live Chat") : t(n.labelKey);
        return (
          <Link
            key={n.href}
            href={n.href}
            aria-label={label}
            data-nav-item={isLiveChat ? "live-chat" : undefined}
            style={{
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              padding: "10px 2px 8px",
              textDecoration: "none",
              color: active ? "#a855f7" : "rgba(157,149,201,0.75)",
              fontSize: 10,
              fontWeight: active ? 700 : 500,
              transition: "color .15s",
            }}
          >
            <span style={{ fontSize: 18 }} aria-hidden>{n.emoji}</span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>{label}</span>
            {active && (
              <span style={{
                width: 20,
                height: 2,
                borderRadius: 1,
                background: "linear-gradient(90deg,#a855f7,#6366f1)",
                marginTop: 1,
              }} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
