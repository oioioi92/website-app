"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { FallbackImage } from "@/components/FallbackImage";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { useLocale } from "@/lib/i18n/context";

const MENU_KEYS = [
  { key: "public.nav.home", href: "/" },
  { key: "public.nav.promotion", href: "/promotion" },
  { key: "public.nav.bonus", href: "/bonus" },
  { key: "public.nav.support", href: "/chat" },
];

export function MobileTopBar({
  logoUrl,
  partnershipBadgeUrl,
  siteName
}: {
  logoUrl: string | null;
  partnershipBadgeUrl: string | null;
  siteName: string;
}) {
  const { t } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuOpen]);

  return (
    <div className="safe-inset-top sticky top-0 z-30 border-b border-[color:var(--p44-grey-light)]/30 bg-[color:var(--p44-header-bg)]/95 backdrop-blur lg:hidden">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4">
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[color:var(--p44-text-dark)] hover:bg-black/5"
            aria-label={t("public.menu.mobileMenu")}
            aria-expanded={menuOpen}
          >
            <span className="text-lg leading-none">☰</span>
          </button>
          {menuOpen && (
            <div className="absolute left-0 top-full mt-1 min-w-[160px] rounded-xl border border-[color:var(--p44-grey-light)]/50 bg-[color:var(--p44-header-bg)] py-2 shadow-xl">
              {MENU_KEYS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-2.5 text-sm font-medium text-[color:var(--p44-text-dark)] hover:bg-[color:var(--p44-green)]/10"
                  onClick={() => setMenuOpen(false)}
                >
                  {t(item.key)}
                </Link>
              ))}
              <div className="mt-2 border-t border-[color:var(--p44-grey-light)]/50 pt-2 px-3">
                <LocaleSwitcher variant="compact" />
              </div>
            </div>
          )}
        </div>
        <Link href="/" className="flex min-w-0 items-center gap-2">
          {logoUrl ? (
            <FallbackImage src={logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
          ) : (
            <span className="text-base font-black tracking-tight text-[color:var(--p44-green)]">PERODUA</span>
          )}
          <span className="truncate text-base font-black tracking-tight text-[color:var(--p44-text-dark)]">{siteName || "BRAND"}</span>
          <span className="text-base font-black text-[color:var(--p44-red)]">44</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded bg-[color:var(--p44-red)] text-xs font-bold text-white">4</span>
          <span className="flex h-8 w-8 items-center justify-center rounded bg-[color:var(--p44-grey-panel)] text-xs font-bold text-white">4</span>
          <Link
            href="/partnership"
            aria-label={t("public.menu.partnership")}
            className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[color:var(--p44-grey-light)] bg-[color:var(--p44-grey-panel)]"
          >
            {partnershipBadgeUrl ? (
              <FallbackImage src={partnershipBadgeUrl} alt="Partnership" className="h-full w-full object-cover" />
            ) : (
              <span className="text-[12px] font-bold text-white">👤</span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}
