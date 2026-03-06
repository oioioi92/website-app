"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n/context";

/** Vivid 底部固定导航（Home / Games / Promo / History / Setting），保证“下面的 bar 不管怎样都一直存在”。 */
export function VividBottomNav() {
  const path = usePathname();
  const { t } = useLocale();
  const BOTTOM_NAV = [
    { label: t("public.vivid.bottomNav.home"),    href: "/",          icon: "🏠" },
    { label: t("public.vivid.bottomNav.games"),   href: "/games",     icon: "🎮" },
    { label: t("public.vivid.bottomNav.promo"),   href: "/promotion", icon: "🎁" },
    { label: t("public.vivid.bottomNav.history"), href: "/history",   icon: "📜" },
    { label: t("public.vivid.bottomNav.setting"),  href: "/settings",  icon: "⚙️" },
  ];
  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "rgba(13,13,26,0.97)",
        borderTop: "1px solid rgba(120,80,255,0.3)",
        backdropFilter: "blur(12px)",
        display: "flex",
        paddingBottom: "env(safe-area-inset-bottom, 4px)",
      }}
    >
      {BOTTOM_NAV.map((n) => {
        const active = path === n.href;
        return (
          <Link
            key={n.href}
            href={n.href}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "10px 4px 8px",
              textDecoration: "none",
              color: active ? "#a855f7" : "rgba(157,149,201,0.75)",
              fontSize: 10,
              fontWeight: active ? 700 : 500,
              transition: "color .15s",
            }}
          >
            <span style={{ fontSize: 18 }}>{n.icon}</span>
            <span>{n.label}</span>
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
