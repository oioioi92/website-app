"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";
import { REPORT_CATALOG } from "@/config/reportCatalog.config";

const SearchIcon = () => (
  <svg className="h-4 w-4 shrink-0 text-[var(--admin-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ArrowIcon = () => (
  <svg className="h-4 w-4 shrink-0 text-[var(--admin-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--admin-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

export function ReportCenter() {
  const { t } = useLocale();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const lower = q.trim().toLowerCase();
    if (!lower) return REPORT_CATALOG;
    return REPORT_CATALOG.map((cat) => ({
      ...cat,
      cards: cat.cards.filter(
        (c) =>
          c.title.toLowerCase().includes(lower) ||
          (c.subtitle || "").toLowerCase().includes(lower) ||
          c.keywords.some((k) => k.toLowerCase().includes(lower))
      )
    })).filter((cat) => cat.cards.length > 0);
  }, [q]);

  return (
    <div className="report-center space-y-8">
      <header className="admin-page-title">
        <h1>{t("admin.reportCenter.allReportsTitle")}</h1>
        <p>{t("admin.reportCenter.searchOrOpen")}</p>
      </header>

      <div className="report-center-search rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel)] px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <SearchIcon />
          <input
            type="search"
            placeholder={t("admin.reportCenter.searchPlaceholder")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-[15px] text-[var(--admin-text)] placeholder-[var(--admin-muted)] focus:outline-none"
            aria-label={t("admin.reportCenter.searchPlaceholder")}
          />
        </div>
      </div>

      <div className="space-y-8">
        {filtered.length === 0 ? (
          <div className="report-center-empty rounded-xl border border-dashed border-[var(--admin-border)] bg-[var(--admin-panel2)] px-6 py-12 text-center">
            <p className="text-[15px] font-medium text-[var(--admin-text)]">{t("admin.reportCenter.noMatch")}</p>
          </div>
        ) : (
          filtered.map((cat) => (
            <section key={cat.key} className="report-center-category">
              <h2 className="report-center-category-title">
                <span>{cat.titleKey ? t(cat.titleKey) : cat.title}</span>
                <span className="report-center-category-count">{cat.cards.length}</span>
              </h2>
              <div className="report-center-grid">
                {cat.cards.map((card) => (
                  <Link
                    key={card.key}
                    href={card.href}
                    className="report-center-card group"
                  >
                    <div className="report-center-card-inner">
                      <div className="report-center-card-content">
                        <span className="report-center-card-title">
                          {card.titleKey ? t(card.titleKey) : card.title}
                        </span>
                        {(card.subtitleKey || card.subtitle) && (
                          <span className="report-center-card-subtitle">
                            {card.subtitleKey ? t(card.subtitleKey) : card.subtitle}
                          </span>
                        )}
                      </div>
                      <ArrowIcon />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
