"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV } from "@/config/admin-nav";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";

type SidebarProps = {
  collapsed: boolean;
};

export function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="admin-sidebar-inner">
        <div className="admin-sidebar-header">
          <span className="admin-sidebar-title">Phase2</span>
        </div>

        <div className="admin-emergency-wrap px-3 py-2 flex-shrink-0">
          <button
            type="button"
            className="w-full h-8 rounded-md border border-white/15 bg-red-500/20 text-white text-xs font-medium hover:bg-red-500/30 transition-colors"
            title="Emergency Lock"
          >
            Emergency Lock
          </button>
        </div>

        <nav className="admin-sidebar-nav flex-1 overflow-y-auto overflow-x-hidden pb-4">
          {ADMIN_NAV.map((group) => (
            <div key={group.key}>
              <div className="admin-nav-group-title">{group.label}</div>
              {group.items.map((item) => {
                const href = item.href ?? "#";
                const active = href !== "#" && (pathname === href || pathname.startsWith(href + "/"));
                return (
                  <Link
                    key={item.key}
                    href={href}
                    className={`admin-nav-item ${active ? "active" : ""}`}
                    title={item.tooltip ?? item.label}
                  >
                    <span className="admin-nav-icon w-[18px] h-[18px] shrink-0 flex items-center justify-center opacity-90 text-[10px]" aria-hidden>●</span>
                    <span className="admin-nav-label">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer border-t border-white/10 p-3 flex-shrink-0 space-y-2">
          <a
            href={process.env.NEXT_PUBLIC_FRONTEND_URL ?? "/"}
            target="_blank"
            rel="noreferrer"
            className="block w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-center text-xs font-medium text-white/90 hover:bg-white/10"
            title="在新标签页打开前台站点"
          >
            打开前台
          </a>
          <AdminLogoutButton />
        </div>
      </div>
    </aside>
  );
}
