"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FallbackImage } from "@/components/FallbackImage";
import { resolveUiAssetByName } from "@/lib/public/namedAssets";
import type { ThemeConfig } from "@/lib/public/theme";

export function MobileBottomNav({ chatUrl, theme }: { chatUrl: string; theme: ThemeConfig }) {
  const pathname = usePathname();
  const items = theme.bottomNav.slice(0, 5);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--p44-grey-light)]/30 bg-[color:var(--p44-header-bg)]/98 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-[520px] grid-cols-5 gap-1.5">
        {items.map((item) => {
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
                key={item.label}
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
                key={item.label}
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
