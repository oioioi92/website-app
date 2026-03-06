"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/admin/Sidebar";
import { AdminQuickActionBar } from "@/components/admin/AdminQuickActionBar";
import { AdminTopbarMenus } from "@/components/admin/AdminTopbarMenus";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { useLocale } from "@/lib/i18n/context";
import { AdminUserProvider } from "@/lib/admin-user-context";
import { AdminApiProvider, AdminForbiddenBanner } from "@/lib/admin-api-context";
import { AdminErrorBoundary } from "@/components/admin/AdminErrorBoundary";

type AdminUser = { id: string; email: string; role: string };

export function AdminShell({ children, user }: { children: React.ReactNode; user?: AdminUser }) {
  const { t } = useLocale();
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    const m = typeof window !== "undefined" ? window.matchMedia("(max-width: 768px)") : null;
    if (m?.matches) setCollapsed(false);
  }, []);
  return (
    <AdminUserProvider user={user}>
    <AdminApiProvider>
    <div className={`admin-shell ${collapsed ? "admin-shell--collapsed" : ""}`} data-admin-theme="light">
      <AdminForbiddenBanner />
      <div
        className="admin-sidebar-backdrop"
        role="button"
        tabIndex={0}
        aria-label={t("admin.collapseMenu")}
        onClick={() => setCollapsed(true)}
        onKeyDown={(e) => e.key === "Enter" && setCollapsed(true)}
      />
      <Sidebar user={user} collapsed={collapsed} onNavigate={() => setCollapsed(true)} />
      <header className="admin-topbar">
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            className="admin-topbar-toggle"
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? t("admin.expandMenu") : t("admin.collapseMenu")}
            aria-label={collapsed ? t("admin.expandMenu") : t("admin.collapseMenu")}
          >
            <svg className="admin-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>
          <Link href="/admin" className="admin-topbar-home font-semibold text-[var(--compact-text)] hover:underline" title={t("admin.home")}>{t("admin.home")}</Link>
          <LocaleSwitcher variant="dropdown" className="admin-topbar-locale admin-topbar-hide-on-mobile ml-2" />
        </div>
        <AdminQuickActionBar />
        <AdminTopbarMenus />
      </header>
      <main className="admin-page">
        <AdminErrorBoundary>{children}</AdminErrorBoundary>
      </main>
    </div>
    </AdminApiProvider>
    </AdminUserProvider>
  );
}
