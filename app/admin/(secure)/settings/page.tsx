"use client";

import Link from "next/link";
import { useAdminUser } from "@/lib/admin-user-context";
import { can } from "@/lib/rbac-client";
import { useLocale } from "@/lib/i18n/context";
import { SETTINGS_NAV } from "@/config/settings-nav";

export default function AdminSettingsPage() {
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
    <div>
      <h1 className="text-lg font-semibold text-[var(--compact-text)]">{t("admin.settingsSection.pageTitle")}</h1>
      <p className="mt-0.5 text-[13px] text-[var(--compact-muted)]">{t("admin.settingsSection.settingsPageSubtitle")}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredNav.map((group) => {
          const first = group.children?.[0];
          const href = first?.href ?? "/admin/settings";
          return (
            <Link
              key={group.key}
              href={href}
              className="admin-card flex flex-col gap-1 p-5 transition hover:border-[var(--compact-primary)] hover:shadow-md"
            >
              <span className="font-medium text-[var(--compact-text)]">{group.label}</span>
              <span className="text-[13px] text-[var(--compact-muted)]">{t(`admin.settingsCard.${group.key}`) || group.description}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
