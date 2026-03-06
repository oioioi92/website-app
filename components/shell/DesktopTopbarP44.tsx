"use client";

import Link from "next/link";
import { useState } from "react";
import { ContactDropdown } from "./ContactDropdown";
import { LanguageModal } from "./LanguageModal";

const nav = [
  { label: "Home", href: "/" },
  { label: "Transaction", href: "/deposit" },
  { label: "Promotion", href: "/promotion" },
  { label: "Bonus", href: "/bonus" },
  { label: "Referral", href: "/#referral" },
  { label: "Feedback", href: "/login" },
];

type LinkItem = { label: string; href: string };

export function DesktopTopbarP44({ contactLinks = [] }: { contactLinks?: LinkItem[] }) {
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState<"EN" | "CN" | "MY">("EN");

  return (
    <>
      {/* 绿色公告条（与参考站一致） */}
      <div className="bg-[#22c55e] px-4 py-1.5 text-center text-sm font-medium text-black">
        Welcome — Check Bonus / Promotion for latest campaigns.
      </div>

      <header className="sticky top-0 z-50 border-b-2 border-[var(--desk-border)] bg-[var(--desk-header-bg)]">
        <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-4 py-3">
          <Link href="/" className="shrink-0 text-xl font-bold tracking-wide text-[var(--desk-accent)] sm:text-2xl">
            KINGDOM888
          </Link>

          <nav className="hidden flex-1 items-center gap-4 text-sm text-[var(--desk-text)] md:flex">
            {nav.map((i) => (
              <Link key={i.href} href={i.href} className="whitespace-nowrap hover:text-[var(--desk-accent)]">
                {i.label}
              </Link>
            ))}
            <ContactDropdown links={contactLinks} />
          </nav>

          {/* 顶栏只保留：Language / Login / Download APK（控制台在右栏） */}
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLangOpen(true)}
              className="flex h-9 items-center rounded-lg border border-[var(--desk-border)] bg-[var(--desk-panel)] px-3 text-sm text-[var(--desk-text)] hover:border-[var(--desk-accent)]"
            >
              {lang}
            </button>
            <Link
              href="/login"
              className="flex h-9 items-center rounded-lg bg-[var(--desk-accent)] px-4 text-sm font-semibold text-black hover:opacity-90"
            >
              Login
            </Link>
            <a
              href="#"
              className="hidden items-center rounded-lg border border-[var(--desk-border)] bg-[var(--desk-panel)] px-3 text-sm text-[var(--desk-text)] hover:border-[var(--desk-accent)] lg:flex"
            >
              Download APK
            </a>
          </div>
        </div>
      </header>

      <LanguageModal
        open={langOpen}
        onClose={() => setLangOpen(false)}
        onSelect={(l) => setLang(l)}
      />
    </>
  );
}
