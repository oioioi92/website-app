"use client";

import Link from "next/link";
import { useState } from "react";
import { FallbackImage } from "@/components/FallbackImage";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { useLocale } from "@/lib/i18n/context";

/** P44-style: Home | Transaction | Promotion | Language | Referral | Feedback | Contact Us | Download APK */
type Social = { label: string; url: string };

export function DesktopTopbar({
  logoUrl,
  siteName = "Site",
  loginUrl = "/login",
  registerUrl = "/register-wa",
  depositUrl = "/deposit",
  contactLinks = [],
  downloadApkUrl
}: {
  logoUrl: string | null;
  siteName?: string;
  loginUrl?: string | null;
  registerUrl?: string | null;
  depositUrl?: string | null;
  contactLinks?: Social[];
  downloadApkUrl?: string | null;
}) {
  const { t } = useLocale();
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 hidden lg:block" data-desktop-header data-testid="topbar-p44">
      <div className="desk-container" style={{ maxWidth: "var(--desk-container-p44, 1280px)" }}>
        <Link href="/" className="flex shrink-0 items-center gap-3">
          {logoUrl ? (
            <FallbackImage src={logoUrl} alt="" className="h-8 w-8 rounded-[18px] object-cover ring-1 ring-white/10" />
          ) : null}
          <span className="text-base font-semibold text-[var(--desk-text)]">{siteName}</span>
        </Link>
        <nav className="flex items-center gap-1 flex-wrap" aria-label="Main">
          <Link href="/" className="nav-link px-3 py-2 rounded-[18px]">Home</Link>
          <Link href={depositUrl || "/deposit"} className="nav-link px-3 py-2 rounded-[18px]">Transaction</Link>
          <Link href="/bonus" className="nav-link px-3 py-2 rounded-[18px]">Promotion</Link>
          <span className="px-2">
            <LocaleSwitcher variant="compact" dark />
          </span>
          <Link href="/#referral" className="nav-link px-3 py-2 rounded-[18px]">Referral</Link>
          <Link href={loginUrl || "/login"} className="nav-link px-3 py-2 rounded-[18px]">Feedback</Link>
          <div className="relative">
            <button
              type="button"
              onClick={() => setContactOpen((o) => !o)}
              className="nav-link px-3 py-2 rounded-[18px]"
            >
              Contact Us
            </button>
            {contactOpen && (
              <>
                <div className="fixed inset-0 z-10" aria-hidden onClick={() => setContactOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 min-w-[180px] rounded-[18px] border-2 border-[var(--desk-border)] bg-[var(--desk-panel)] py-2 shadow-lg">
                  {contactLinks.length > 0 ? (
                    contactLinks.map((s) => (
                      <a
                        key={s.url}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-2 text-sm text-[var(--desk-text)] hover:bg-[var(--desk-panel-hover)]"
                      >
                        {s.label}
                      </a>
                    ))
                  ) : (
                    <Link href="/chat" className="block px-4 py-2 text-sm text-[var(--desk-text)] hover:bg-[var(--desk-panel-hover)]">
                      Live Chat
                    </Link>
                  )}
                </div>
              </>
            )}
          </div>
          {downloadApkUrl ? (
            <a
              href={downloadApkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="desk-btn-primary h-10 min-h-0 px-4 text-sm"
            >
              Download APK
            </a>
          ) : (
            <span className="desk-btn-secondary h-10 min-h-0 px-4 text-sm opacity-70 cursor-not-allowed">
              Download APK
            </span>
          )}
        </nav>
        <div className="flex shrink-0 items-center gap-3">
          <Link href={registerUrl || "/register-wa"} className="desk-btn-secondary h-10 min-h-0 px-4 text-sm">
            {t("public.actions.register")}
          </Link>
          <Link href={loginUrl || "/login"} className="desk-btn-primary h-10 min-h-0 px-4 text-sm">
            {t("public.actions.login")}
          </Link>
        </div>
      </div>
    </header>
  );
}
