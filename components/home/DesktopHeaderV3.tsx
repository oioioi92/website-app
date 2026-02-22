"use client";

import Link from "next/link";
import { useState } from "react";
import { FallbackImage } from "@/components/FallbackImage";

const LANG_OPTIONS = [
  { value: "en", label: "EN" },
  { value: "zh", label: "中文" }
];

export function DesktopHeaderV3({
  logoUrl,
  siteName = "Site"
}: {
  logoUrl: string | null;
  siteName?: string;
}) {
  const [lang, setLang] = useState<"en" | "zh">("en");

  return (
    <header className="sticky top-0 z-40 hidden border-b border-[color:var(--p44-grey-light)]/30 bg-[color:var(--p44-header-bg)] backdrop-blur lg:flex lg:flex-col" data-testid="header-v3">
      <div className="mx-auto flex h-16 w-full max-w-[1320px] items-center justify-between px-6">
        <button type="button" className="flex h-9 w-9 items-center justify-center rounded-lg text-[color:var(--p44-text-dark)]" aria-label="菜单">
          <span className="text-xl leading-none">☰</span>
        </button>
        <Link href="/" className="flex items-center gap-2">
          {logoUrl ? (
            <FallbackImage
              src={logoUrl}
              alt="Logo"
              className="ui-asset-img ui-desktop-logo rounded-lg object-cover ring-1 ring-[color:var(--p44-green)]/40"
            />
          ) : (
            <div className="ui-desktop-logo rounded-lg bg-[color:var(--p44-green)]/20 ring-1 ring-[color:var(--p44-green)]/40" />
          )}
          <span className="text-lg font-black tracking-tight text-[color:var(--p44-text-dark)]">{siteName || "PERODUA"}</span>
          <span className="text-lg font-black text-[color:var(--p44-red)]">44</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded bg-[color:var(--p44-red)] text-xs font-bold text-white">4</span>
          <span className="flex h-8 w-8 items-center justify-center rounded bg-[color:var(--p44-grey-panel)] text-xs font-bold text-white">4</span>
          <div className="flex items-center gap-1 rounded-lg border border-[color:var(--p44-grey-light)]/50 bg-white/80 p-0.5" role="group" aria-label="Language">
            {LANG_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setLang(opt.value as "en" | "zh")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  lang === opt.value
                    ? "bg-[color:var(--p44-green)]/30 text-[color:var(--p44-green-dark)]"
                    : "text-[color:var(--p44-text-dark)]/70 hover:bg-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="hidden lg:block border-t border-[color:var(--p44-green-dark)] bg-[color:var(--p44-bar-green)] px-4 py-1.5 text-center text-[12px] font-semibold text-white">
        Welcome! Fair and trusted platform — No Risk. Play with confidence.
      </div>
    </header>
  );
}
