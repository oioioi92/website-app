"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLocale();
  const [bankOpen, setBankOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const bankRef = useRef<HTMLDivElement>(null);
  const adminRef = useRef<HTMLDivElement>(null);
  const isChatPage = pathname?.startsWith("/admin/chat") ?? false;

  useEffect(() => {
    fetch("/api/admin/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setUser(d.user ?? null))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    function closeAll(e: MouseEvent) {
      const t = e.target as Node;
      if (bankRef.current && !bankRef.current.contains(t)) setBankOpen(false);
      if (adminRef.current && !adminRef.current.contains(t)) setAdminOpen(false);
    }
    document.addEventListener("click", closeAll);
    return () => document.removeEventListener("click", closeAll);
  }, []);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="admin-topbar-menus flex items-center gap-2 text-[var(--compact-muted)]">
      <WhatsAppStatusBadge />
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
      <div className="relative" ref={bankRef}>
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
      <div className="relative" ref={adminRef}>
        <button
          type="button"
          onClick={() => setAdminOpen((v) => !v)}
          className="flex items-center gap-1.5 rounded px-2.5 py-1.5 font-semibold text-[var(--compact-text)] hover:bg-black/5"
          title={user?.email ?? t("admin.admin")}
        >
          <span className="text-[14px]">👤</span>
          <span>{t("admin.admin")}</span>
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {adminOpen && (
          <div className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-lg border border-[var(--compact-card-border)] bg-[var(--compact-card-bg)] py-1 shadow-lg">
            {user && (
              <div className="border-b border-[var(--compact-card-border)] px-4 py-2 text-[12px] text-[var(--compact-muted)]">
                {user.email}
              </div>
            )}
            <Link
              href="/admin/settings/profile"
              onClick={() => setAdminOpen(false)}
              className="block px-4 py-2 text-[13px] text-[var(--compact-text)] hover:bg-[var(--compact-sb-hover)]"
            >
              {t("admin.personalSettings")}
            </Link>
            <button
              type="button"
              onClick={() => {
                setAdminOpen(false);
                void logout();
              }}
              className="w-full px-4 py-2 text-left text-[13px] text-[var(--compact-danger)] hover:bg-red-50"
            >
              {t("admin.logout")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
