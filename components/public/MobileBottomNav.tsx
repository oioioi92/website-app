"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FallbackImage } from "@/components/FallbackImage";
import { resolveUiAssetByName } from "@/lib/public/namedAssets";
import { useLocale } from "@/lib/i18n/context";
import type { ThemeConfig } from "@/lib/public/theme";
import type { ThemeBottomNavItem } from "@/lib/public/theme";

const DEFAULT_ITEMS: ThemeBottomNavItem[] = [
  { href: "/", label: "Home", icon: "🏠", badge: null },
  { href: "/games", label: "Games", icon: "🎮", badge: null },
  { href: "/promotion", label: "Promo", icon: "🎁", badge: null },
  { href: "/history", label: "History", icon: "📜", badge: null },
  { href: "/chat", label: "Live Chat", icon: "💬", badge: null },
  { href: "/settings", label: "Setting", icon: "⚙️", badge: null },
];

/** 从 theme 里按 href 找对应项，找不到用默认。 */
function pickItem(list: ThemeBottomNavItem[], href: string, fallback: ThemeBottomNavItem): ThemeBottomNavItem {
  const normalized = href.toLowerCase().replace(/\/$/, "") || "/";
  const found = list.find((x) => (x.href ?? "").toLowerCase().replace(/\/$/, "") === normalized);
  return found ?? fallback;
}

/**
 * 底部栏固定 6 项，顺序：Home, Games, Promo, History, Live Chat, Setting。
 * 第 5 项（History 与 Setting 之间）固定为 Live Chat，文案用 i18n。
 */
function buildBottomNavWithLiveChat(
  themeNav: ThemeBottomNavItem[],
  liveChatLabel: string
): ThemeBottomNavItem[] {
  const list = Array.isArray(themeNav) ? themeNav : [];
  const home = pickItem(list, "/", DEFAULT_ITEMS[0]);
  const games = pickItem(list, "/games", DEFAULT_ITEMS[1]);
  const promo = pickItem(list, "/promotion", pickItem(list, "/bonus", DEFAULT_ITEMS[2]));
  const history = pickItem(list, "/history", DEFAULT_ITEMS[3]);
  const setting = pickItem(list, "/settings", DEFAULT_ITEMS[5]);
  const liveChatItem: ThemeBottomNavItem = {
    href: "/chat",
    label: liveChatLabel,
    icon: "💬",
    badge: null,
  };
  return [
    { ...home, href: "/", label: home.label },
    { ...games, href: "/games", label: games.label },
    { ...promo, href: promo.href, label: promo.label },
    { ...history, href: "/history", label: history.label },
    liveChatItem,
    { ...setting, href: "/settings", label: setting.label },
  ];
}

export function MobileBottomNav({ chatUrl, theme }: { chatUrl: string; theme: ThemeConfig }) {
  const pathname = usePathname();
  const { t } = useLocale();
  const themeNav = theme?.bottomNav ?? [];
  const liveChatLabel = t("public.vivid.bottomNav.liveChat") || "Live Chat";
  const items = buildBottomNavWithLiveChat(themeNav, liveChatLabel);

  return (
    <nav data-mobile-shell-nav data-bottom-nav-items="6" className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--p44-grey-light)]/30 bg-[color:var(--p44-header-bg)]/98 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-[520px] grid-cols-6 gap-1.5" style={{ gridTemplateColumns: "repeat(6, minmax(0, 1fr))" }}>
        {items.map((item, index) => {
          const labelLower = item.label.toLowerCase();
          const hrefLower = item.href.toLowerCase();
          const isChatItem =
            labelLower === "support" ||
            labelLower.includes("chat") ||
            hrefLower === "/chat" ||
            hrefLower.startsWith("/chat#");
          const resolvedHref = isChatItem ? (chatUrl && chatUrl.trim().length > 0 ? chatUrl : "/chat") : item.href;

          const baseHref = (isChatItem ? "/chat" : resolvedHref).split("#")[0] ?? resolvedHref;
          const isHashOnly = baseHref === "/" && item.href.includes("#");
          const isActive = isHashOnly ? false : baseHref === "/" ? pathname === "/" : pathname.startsWith(baseHref);
          
          const className = `relative flex min-h-[44px] flex-col items-center justify-center rounded-xl border text-[9px] font-bold tracking-wide transition ${
            isActive
              ? "border-[color:var(--p44-green)]/70 bg-[color:var(--p44-green)]/20 text-[color:var(--p44-green-dark)]"
              : "border-transparent bg-transparent text-[color:var(--p44-text-dark)]/80 hover:text-[color:var(--p44-text-dark)]"
          }`;
          
          const namedIcon =
            resolveUiAssetByName(item.label) ??
            resolveUiAssetByName(isChatItem ? "chat" : resolvedHref) ??
            resolveUiAssetByName(resolvedHref);
          
          const isExternal = /^https?:\/\//i.test(resolvedHref);
          const useExternalAnchor = isExternal;

          return (
            useExternalAnchor ? (
              <a
                key={`nav-${index}-${item.href}`}
                href={resolvedHref}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
              {namedIcon ? (
                <span className="flex h-4 w-4 items-center justify-center">
                  <FallbackImage src={namedIcon} alt={item.label} className="ui-asset-img ui-bottomnav-icon object-contain" />
                </span>
              ) : (
                <span className="text-[14px] leading-none mb-0.5">{item.icon ?? ""}</span>
              )}
              <span className="mt-0.5">{item.label}</span>
              {item.badge ? (
                <span className="absolute -right-1 -top-1 rounded-full bg-[#F28B2D] px-1.5 text-[8px] text-black font-extrabold">
                  {item.badge}
                </span>
              ) : null}
              </a>
            ) : (
              <Link
                key={`nav-${index}-${item.href}`}
                href={resolvedHref}
                className={className}
              >
                {namedIcon ? (
                  <span className="flex h-4 w-4 items-center justify-center">
                    <FallbackImage src={namedIcon} alt={item.label} className="ui-asset-img ui-bottomnav-icon object-contain" />
                  </span>
                ) : (
                  <span className="text-[14px] leading-none mb-0.5">{item.icon ?? ""}</span>
                )}
                <span className="mt-0.5">{item.label}</span>
                {item.badge ? (
                  <span className="absolute -right-1 -top-1 rounded-full bg-[#F28B2D] px-1.5 text-[8px] text-black font-extrabold">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            )
          );
        })}
      </div>
    </nav>
  );
}
