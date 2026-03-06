"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/context";

const DISPLAY_OPTIONS = [
  { value: "daily", labelKey: "admin.txReport.displayDaily" },
  { value: "monthly", labelKey: "admin.txReport.displayMonthly" },
  { value: "yearly", labelKey: "admin.txReport.displayYearly" },
];

type ReportPlaceholderProps = {
  title: string;
  description?: string;
  /** 表头列：如 ["Date", "Count", "Total"] */
  columns?: { header: string; align?: "left" | "right" }[];
};

const defaultColumns = [
  { header: "admin.reportPlaceholder.colDate", align: "left" as const },
  { header: "admin.reportPlaceholder.colCount", align: "right" as const },
  { header: "admin.reportPlaceholder.colTotal", align: "right" as const },
];

export function ReportPlaceholder({
  title,
  description,
  columns = defaultColumns.map((c) => ({ header: c.header, align: c.align })),
}: ReportPlaceholderProps) {
  const { t } = useLocale();
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [groupBy, setGroupBy] = useState<"daily" | "monthly" | "yearly">("daily");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
          {t("admin.txReport.filters")}
        </h2>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">{t("admin.txReport.periodFrom")}</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-800 [color-scheme:light] focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">{t("admin.txReport.periodTo")}</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-800 [color-scheme:light] focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">{t("admin.txReport.display")}</label>
            <div className="flex rounded-lg border border-slate-200 bg-slate-50/80 p-0.5">
              {DISPLAY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setGroupBy(opt.value as "daily" | "monthly" | "yearly")}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    groupBy === opt.value ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {t(opt.labelKey as "admin.txReport.displayDaily")}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-400"
          >
            SEARCH
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px] text-sm">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-700 text-white">
                {columns.map((col, i) => (
                  <th
                    key={i}
                    className={`px-4 py-3 font-semibold ${col.align === "right" ? "text-right" : "text-left"}`}
                  >
                    {col.header.startsWith("admin.") ? t(col.header as "admin.reportPlaceholder.colDate") : col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 text-center text-slate-400"
                >
                  {t("admin.reportPlaceholder.comingSoon")}
                </td>
              </tr>
              <tr className="border-t-2 border-amber-400 bg-amber-500/95 text-white font-bold shadow-inner">
                <td className="px-4 py-3">{t("admin.txReport.total")}</td>
                {columns.slice(1).map((_, i) => (
                  <td key={i} className="px-4 py-3 text-right tabular-nums">
                    0.00
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
