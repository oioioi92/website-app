"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";

type Crumb = { label: string; href?: string };

type SettingsPageShellProps = {
  breadcrumbs: Crumb[];
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function SettingsPageShell({ breadcrumbs, title, subtitle, children }: SettingsPageShellProps) {
  const { t } = useLocale();
  return (
    <div>
      <nav className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-[var(--compact-muted)]">
        <Link href="/admin/settings" className="hover:text-[var(--compact-primary)]">
          {t("admin.settingsSection.pageTitle") ?? "Settings"}
        </Link>
        {breadcrumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-x-2">
            <span>/</span>
            {c.href ? (
              <Link href={c.href} className="hover:text-[var(--compact-primary)]">
                {c.label}
              </Link>
            ) : (
              <span>{c.label}</span>
            )}
          </span>
        ))}
      </nav>
      <h1 className="mt-2 text-lg font-semibold text-[var(--compact-text)]">{title}</h1>
      {subtitle != null && subtitle !== "" && (
        <p className="mt-0.5 text-[13px] text-[var(--compact-muted)]">{subtitle}</p>
      )}
      <div className="mt-6">{children}</div>
    </div>
  );
}
