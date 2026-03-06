"use client";

import type { JSX } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV } from "@/config/admin-nav";
import { SETTINGS_NAV } from "@/config/settings-nav";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { useLocale } from "@/lib/i18n/context";
import { useAdminUser } from "@/lib/admin-user-context";
import { can } from "@/lib/rbac-client";

const NAV_ICONS: Record<string, JSX.Element> = {
  chat: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
      <path d="M15 7v1a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h1a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd"/>
    </svg>
  ),
  "user-plus": (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"/>
    </svg>
  ),
  deposit: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd"/>
    </svg>
  ),
  withdraw: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd"/>
    </svg>
  ),
  transfer: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z"/>
    </svg>
  ),
  "bar-chart": (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
    </svg>
  ),
  game: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z"/>
    </svg>
  ),
  gift: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd"/>
      <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z"/>
    </svg>
  ),
  bank: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
    </svg>
  ),
  report: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd"/>
    </svg>
  ),
  list: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
    </svg>
  ),
  search: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
    </svg>
  ),
  "check-list": (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
    </svg>
  ),
  promo: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
    </svg>
  ),
  image: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
    </svg>
  ),
  users: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
    </svg>
  ),
  agent: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd"/>
    </svg>
  ),
  tree: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path d="M2 4a1 1 0 011-1h2a1 1 0 011 1v1h4V4a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-.5H6V6a1 1 0 01-1 1H3a1 1 0 01-1-1V4zM9 11V9h2v2h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-.5H9v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-2a1 1 0 011-1h2z"/>
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
    </svg>
  ),
  theme: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
    </svg>
  ),
  tools: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.533 1.533 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
    </svg>
  ),
  security: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
    </svg>
  ),
  domain: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A59.408 59.408 0 0110 3.597a59.46 59.46 0 018.21 2.523 2 2 0 01 0 2.829 59.456 59.456 0 01-1.858 2.102 2 2 0 00-.994 1.606v.003a2 2 0 01.006.037 59.461 59.461 0 01-.006.038 2 2 0 00.994 1.607 59.456 59.456 0 011.858 2.102 2 2 0 010 2.829 59.456 59.456 0 01-1.858 2.102 2 2 0 00-.994 1.606v.004a2 2 0 01.004.038 59.46 59.46 0 01-.004.038 2 2 0 00.994 1.606 59.456 59.456 0 01-1.858 2.102 2 2 0 010-2.829 59.456 59.456 0 001.858-2.102 2 2 0 00.994-1.605 59.46 59.46 0 00-.994-1.605 59.456 59.456 0 01-1.858-2.102z" clipRule="evenodd"/>
    </svg>
  ),
};

function NavIcon({ icon }: { icon?: string }) {
  const el = icon ? NAV_ICONS[icon] : null;
  if (el) return <span className="admin-nav-icon w-[18px] h-[18px] shrink-0 flex items-center justify-center opacity-80" aria-hidden>{el}</span>;
  return <span className="admin-nav-icon w-[18px] h-[18px] shrink-0 flex items-center justify-center opacity-60 text-[10px]" aria-hidden>●</span>;
}

type SidebarProps = {
  collapsed: boolean;
  onNavigate?: () => void;
  user?: { id: string; email: string; role: string };
};

export function Sidebar({ collapsed, onNavigate, user }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLocale();
  const adminUser = useAdminUser() ?? user;
  const role = adminUser?.role ?? "admin";
  const isInSettings = pathname.startsWith("/admin/settings");
  const filteredSettingsNav = adminUser
    ? SETTINGS_NAV.map((group) => ({
        ...group,
        children: (group.children ?? []).filter(
          (item) => can(adminUser.role, item.permission ?? "settings")
        ),
      })).filter((group) => group.children.length > 0)
    : SETTINGS_NAV;

  return (
    <aside className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="admin-sidebar-inner">
        <div className="admin-emergency-wrap px-3 py-2 flex-shrink-0">
          <button
            type="button"
            className="w-full h-8 rounded-md border border-white/15 bg-red-500/20 text-white text-xs font-medium hover:bg-red-500/30 transition-colors"
            title={t("admin.emergencyLock")}
          >
            {t("admin.emergencyLock")}
          </button>
        </div>

        <nav className="admin-sidebar-nav flex-1 overflow-y-auto overflow-x-hidden pb-4">
          {ADMIN_NAV.map((group) => (
            <div key={group.key}>
              <div className="admin-nav-group-title">{t(`admin.groups.${group.key}`)}</div>
              {group.items.map((item) => {
                if (item.key === "settings") {
                  const settingsActive = pathname === "/admin/settings" || pathname.startsWith("/admin/settings/");
                  const label = (() => {
                    const out = t(`admin.nav.${item.key}`);
                    if (out && !out.startsWith("admin.nav.")) return out;
                    return item.label;
                  })();
                  return (
                    <div key={item.key} className="admin-nav-settings-wrap">
                      <div onClick={() => onNavigate?.()}>
                        <Link
                          href="/admin/settings"
                          className={`admin-nav-item ${settingsActive ? "active" : ""}`}
                          title={t(`admin.navTooltip.${item.key}`) || label}
                        >
                          <NavIcon icon={item.icon} />
                          <span className="admin-nav-label">{label}</span>
                        </Link>
                      </div>
                      {isInSettings && (
                        <div className="admin-nav-settings-list" onClick={() => onNavigate?.()}>
                          {filteredSettingsNav.map((grp) => (
                            <div key={grp.key} className="admin-nav-settings-group">
                              {(grp.children ?? []).map((child) => {
                                const childActive = pathname === child.href || (child.href !== "/admin/settings" && pathname.startsWith(child.href));
                                return (
                                  <Link
                                    key={child.key}
                                    href={child.href}
                                    className={`admin-nav-item admin-nav-settings-item ${childActive ? "active" : ""}`}
                                    title={child.label}
                                  >
                                    <span className="admin-nav-label">{child.label}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                const href = item.href ?? "#";
                const active = href !== "#" && (pathname === href || pathname.startsWith(href + "/"));
                const label = (() => {
                  const out = t(`admin.nav.${item.key}`);
                  if (out && !out.startsWith("admin.nav.")) return out;
                  return item.label;
                })();
                return (
                  <div key={item.key} onClick={() => onNavigate?.()}>
                    <Link
                      href={href}
                      className={`admin-nav-item ${active ? "active" : ""}`}
                      title={t(`admin.navTooltip.${item.key}`) || label}
                    >
                      <NavIcon icon={item.icon} />
                      <span className="admin-nav-label">{label}</span>
                    </Link>
                  </div>
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
            title={t("admin.openFront")}
          >
            {t("admin.openFront")}
          </a>
          <AdminLogoutButton />
        </div>
      </div>
    </aside>
  );
}
