"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "@/lib/i18n/context";
import { LOCALE_LABELS, type Locale } from "@/lib/i18n/types";

const LOCALES: Locale[] = ["zh", "en", "ms"];

type LocaleSwitcherProps = {
  /** 紧凑样式（按钮组） */
  variant?: "compact" | "dropdown";
  className?: string;
  /** 用于后台等深色背景 */
  dark?: boolean;
};

export function LocaleSwitcher({ variant = "compact", className = "", dark = false }: LocaleSwitcherProps) {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  if (variant === "dropdown") {
    return (
      <div className={`relative ${className}`} ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`flex items-center gap-1 rounded border px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 ${
            dark
              ? "border-white/20 bg-white/10 text-white focus:ring-white/30"
              : "border-[color:var(--p44-grey-light)]/50 bg-white/80 text-[color:var(--p44-text-dark)] focus:ring-[color:var(--p44-green)]/30"
          }`}
          aria-label="Language"
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          {LOCALE_LABELS[locale]}
          <span className="text-[10px] opacity-80" aria-hidden>▼</span>
        </button>
        {open && (
          <div
            className="absolute right-0 top-full z-50 mt-1 min-w-[140px] rounded-lg border border-[var(--compact-card-border)] bg-white py-1 shadow-lg"
            role="listbox"
            aria-label="Language options"
          >
            {LOCALES.map((l) => (
              <button
                key={l}
                type="button"
                role="option"
                aria-selected={locale === l}
                onClick={() => {
                  setLocale(l);
                  setOpen(false);
                }}
                className={`block w-full px-4 py-2.5 text-left text-sm font-medium text-[#1e2430] hover:bg-slate-100 ${
                  locale === l ? "bg-sky-50 text-sky-700" : ""
                }`}
              >
                {LOCALE_LABELS[l]}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-0.5 rounded-lg border p-0.5 ${className} ${
        dark
          ? "border-white/20 bg-white/10"
          : "border-[color:var(--p44-grey-light)]/50 bg-white/80"
      }`}
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          className={`rounded-md px-2.5 py-1.5 text-sm font-medium transition ${
            locale === l
              ? dark
                ? "bg-white/20 text-white"
                : "bg-[color:var(--p44-green)]/30 text-[color:var(--p44-green-dark)]"
              : dark
                ? "text-white/70 hover:bg-white/10"
                : "text-[color:var(--p44-text-dark)]/70 hover:bg-white"
          }`}
        >
          {LOCALE_LABELS[l]}
        </button>
      ))}
    </div>
  );
}
