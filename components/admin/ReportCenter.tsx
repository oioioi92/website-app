"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";
import { useAdminUser } from "@/lib/admin-user-context";
import { can } from "@/lib/rbac-client";
import { REPORT_CATALOG } from "@/config/reportCatalog.config";

export function ReportCenter() {
  const { t } = useLocale();
  const [q, setQ] = useState("");
  const user = useAdminUser();
  const canApprove = user ? can(user.role, "approve") : false;

  const filtered = useMemo(() => {
    const lower = q.trim().toLowerCase();
    let catalog = REPORT_CATALOG.map((cat) => ({
      ...cat,
      cards: cat.cards.filter((c) => {
        if (c.requiresApprove && !canApprove) return false;
        if (!lower) return true;
        return (
          c.title.toLowerCase().includes(lower) ||
          (c.subtitle && c.subtitle.toLowerCase().includes(lower)) ||
          c.keywords.some((k) => k.toLowerCase().includes(lower))
        );
      }),
    })).filter((cat) => cat.cards.length > 0);
    return catalog;
  }, [q, canApprove]);

  return (
    <div className="space-y-8">
      <header className="admin-page-title">
        <h1>{t("admin.reportCenter.allReportsTitle")}</h1>
        <p>{t("admin.reportCenter.searchOrOpen")}</p>
      </header>

      <div className="admin-card p-4">
        <input
          type="search"
          placeholder={t("admin.reportCenter.searchPlaceholder")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="admin-compact-input w-full max-w-md rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
        />
      </div>

      <div className="space-y-5">
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-500">{t("admin.reportCenter.noMatch")}</p>
        ) : (
          filtered.map((cat) => (
            <div key={cat.key}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{cat.titleKey ? t(cat.titleKey) : cat.title}</h3>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {cat.cards.map((card) => (
                  <Link
                    key={card.key}
                    href={card.href}
                    className="flex flex-col gap-0.5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
                  >
                    <span className="font-medium text-slate-800">{card.titleKey ? t(card.titleKey) : card.title}</span>
                    {(card.subtitleKey || card.subtitle) && (
                      <span className="text-xs text-slate-500">{card.subtitleKey ? t(card.subtitleKey) : card.subtitle}</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
