"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { REPORT_CATALOG } from "@/config/reportCatalog.config";

export function ReportCenter() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const lower = q.trim().toLowerCase();
    if (!lower) return REPORT_CATALOG;
    return REPORT_CATALOG.map((cat) => ({
      ...cat,
      cards: cat.cards.filter(
        (c) =>
          c.title.toLowerCase().includes(lower) ||
          (c.subtitle && c.subtitle.toLowerCase().includes(lower)) ||
          c.keywords.some((k) => k.toLowerCase().includes(lower))
      )
    })).filter((cat) => cat.cards.length > 0);
  }, [q]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-[var(--compact-text)]">Report Center</h1>
        <p className="mt-0.5 text-[13px] text-[var(--compact-muted)]">搜索或按分类打开报表</p>
      </div>

      <div className="admin-card p-4">
        <input
          type="search"
          placeholder="搜索：winloss、对账、gateway、bonus、入款…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="admin-compact-input w-full max-w-md rounded-lg border border-[var(--compact-card-border)] bg-[var(--compact-page-bg)] px-3 text-[var(--compact-text)] placeholder-[var(--compact-muted)] focus:border-[var(--compact-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--compact-primary)]"
        />
      </div>

      <div className="space-y-6">
        {filtered.length === 0 ? (
          <p className="text-[13px] text-[var(--compact-muted)]">无匹配报表</p>
        ) : (
          filtered.map((cat) => (
            <div key={cat.key}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--compact-muted)]">{cat.title}</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {cat.cards.map((card) => (
                  <Link
                    key={card.key}
                    href={card.href}
                    className="admin-card flex flex-col gap-1 p-4 transition hover:border-[var(--compact-primary)] hover:shadow-md"
                  >
                    <span className="font-medium text-[var(--compact-text)]">{card.title}</span>
                    {card.subtitle && <span className="text-xs text-[var(--compact-muted)]">{card.subtitle}</span>}
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
