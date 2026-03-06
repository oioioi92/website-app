"use client";

import Link from "next/link";
import { FallbackImage } from "@/components/FallbackImage";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { useLocale } from "@/lib/i18n/context";

/** Desktop KINGDOM888-style nav: Home, Games, Promo, Bonus, Support (DESKTOP-UI-DESIGN-SPEC) */
const NAV_KEYS = [
  { key: "public.nav.home", href: "/" },
  { key: "public.nav.game", href: "/games" },
  { key: "promo", href: "/promotion" },
  { key: "public.nav.bonus", href: "/bonus" },
  { key: "public.nav.support", href: "/chat" },
];

const NAV_LABELS: Record<string, string> = {
  "public.nav.home": "Home",
  "public.nav.game": "Games",
  "promo": "Promo",
  "public.nav.bonus": "Bonus",
  "public.nav.support": "Support",
};

export function DesktopHeaderV3({
  logoUrl,
  siteName = "Site",
  loginUrl,
  registerUrl
}: {
  logoUrl: string | null;
  siteName?: string;
  loginUrl?: string | null;
  registerUrl?: string | null;
}) {
  const { t } = useLocale();

  return (
    <header className="sticky top-0 z-40 hidden lg:block" data-desktop-header data-testid="header-v3">
      <div className="desk-container">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          {logoUrl ? (
            <FallbackImage
              src={logoUrl}
              alt=""
              className="h-8 w-8 rounded-[18px] object-cover ring-1 ring-white/10"
            />
          ) : null}
          <span className="text-base font-semibold text-[var(--desk-text)]">{siteName || "Site"}</span>
        </Link>
        <nav className="flex items-center gap-1" aria-label={t("public.menu.aria")}>
          {NAV_KEYS.map((item) => (
            <Link key={item.href + item.key} href={item.href} className="nav-link">
              {NAV_LABELS[item.key] ?? t(item.key)}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-3">
          <LocaleSwitcher variant="compact" dark />
          <Link href={registerUrl || "/register-wa"} className="desk-btn-secondary">
            {t("public.actions.register")}
          </Link>
          <Link href={loginUrl || "/login"} className="desk-btn-primary">
            {t("public.actions.login")}
          </Link>
        </div>
      </div>
    </header>
  );
}
