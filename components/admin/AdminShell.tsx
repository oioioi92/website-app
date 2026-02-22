"use client";

import { useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className={`admin-shell ${collapsed ? "admin-shell--collapsed" : ""}`} data-admin-theme="light">
      <Sidebar collapsed={collapsed} />
      <header className="admin-topbar">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="admin-topbar-toggle"
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? "展开菜单" : "收起菜单"}
            aria-label={collapsed ? "展开菜单" : "收起菜单"}
          >
            <svg className="admin-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>
          <span className="font-semibold text-[13px] text-[var(--compact-text)]">Admin</span>
        </div>
        <div className="flex items-center gap-3 text-[13px] text-[var(--compact-muted)]">
          <span className="text-red-600 font-bold text-xs uppercase tracking-wide">BANK MAINTENANCE</span>
          <span>👤 Admin</span>
        </div>
      </header>
      <main className="admin-page">{children}</main>
    </div>
  );
}
