"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n/context";
import { useAdminUser } from "@/lib/admin-user-context";
import { can } from "@/lib/rbac-client";
import { SETTINGS_NAV } from "@/config/settings-nav";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const { t } = useLocale();
  const user = useAdminUser();

  const filteredNav = user
    ? SETTINGS_NAV.map((group) => ({
        ...group,
        children: (group.children ?? []).filter(
          (item) => can(user.role, item.permission ?? "settings")
        ),
      })).filter((group) => group.children.length > 0)
    : SETTINGS_NAV;

  return (
    <div className="flex min-h-0 flex-1 gap-6">
      <aside className="w-56 shrink-0 overflow-y-auto border-r border-slate-200 bg-slate-50/50 py-4">
        <nav className="space-y-1 px-2">
          <Link
            href="/admin/settings"
            className="mb-3 block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200/60"
          >
            ← {t("admin.settingsSection.backToSettings")}
          </Link>
          {filteredNav.map((group) => (
            <div key={group.key} className="space-y-0.5">
              <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {group.label}
              </div>
              {(group.children ?? []).map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin/settings" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-indigo-100 text-indigo-800"
                        : "text-slate-700 hover:bg-slate-200/60"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 py-2">{children}</main>
    </div>
  );
}
