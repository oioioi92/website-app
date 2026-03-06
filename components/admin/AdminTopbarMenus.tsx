"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WhatsAppStatusBadge } from "@/components/admin/WhatsAppStatusBadge";
import { useLocale } from "@/lib/i18n/context";

const BANK_ITEMS_KEYS = [
  { key: "site", href: "/admin/site" },
  { key: "settingApi", href: "/admin/settings/game-api" },
  { key: "settingWhatsApp", href: "/admin/settings/whatsapp" },
  { key: "settingBank", href: "/admin/settings/bank" },
  { key: "settingProfile", href: "/admin/settings/profile" },
] as const;

export function AdminTopbarMenus() {
  const pathname = usePathname();
  const { t } = useLocale();
  const [bankOpen, setBankOpen] = useState(false);
  const bankRef = useRef<HTMLDivElement>(null);
  const isChatPage = pathname?.startsWith("/admin/chat") ?? false;

  useEffect(() => {
    function closeAll(e: MouseEvent) {
      const target = e.target as Node;
      if (bankRef.current && !bankRef.current.contains(target)) setBankOpen(false);
    }
    document.addEventListener("click", closeAll);
    return () => document.removeEventListener("click", closeAll);
  }, []);

  return (
    <div className="admin-topbar-menus flex items-center gap-2 text-[var(--compact-muted)]">
      <span className="admin-topbar-hide-on-mobile"><WhatsAppStatusBadge /></span>
      {isChatPage && (
        <>
          <Link
            href="/admin/chat/templates"
            className="rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            {t("admin.templates")}
          </Link>
          <Link
            href="/admin/chat/bot"
            className="rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            {t("admin.settings")}
          </Link>
        </>
      )}
      <div className="relative admin-topbar-hide-on-mobile" ref={bankRef}>
        <button
          type="button"
          onClick={() => setBankOpen((v) => !v)}
          title={t("admin.bankMaintenance")}
          className="flex items-center justify-center rounded border border-red-500/60 bg-red-500/10 p-2 text-red-600 hover:bg-red-500/20"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        {bankOpen && (
          <div className="absolute right-0 top-full z-50 mt-1 min-w-[200px] rounded-lg border border-[var(--compact-card-border)] bg-[var(--compact-card-bg)] py-1 shadow-lg">
            {BANK_ITEMS_KEYS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                title={t(`admin.topbar.${item.key}`)}
                onClick={() => setBankOpen(false)}
                className="block px-4 py-2 text-[13px] text-[var(--compact-text)] hover:bg-[var(--compact-sb-hover)]"
              >
                {t(`admin.topbar.${item.key}`)}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
