"use client";

import { useState } from "react";
import Link from "next/link";
import { REPORT_GROUPS, LEGACY_REPORTS } from "@/lib/backoffice/report-center-config";

export function AdminReportsNav() {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const o: Record<string, boolean> = {};
    REPORT_GROUPS.forEach((g, i) => {
      o[g.title] = i === 0;
    });
    return o;
  });

  const toggle = (title: string) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <div className="rounded-lg border border-sky-200/80 bg-sky-50/80 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-sky-900 border-b border-sky-200/80">
        <svg className="h-4 w-4 shrink-0 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        Report Center
      </div>
      <nav className="py-1">
        <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">常用</div>
        <ul className="space-y-0.5">
          {LEGACY_REPORTS.map((item) => (
            <li key={item.slug}>
              <Link href={`/admin/reports/${item.slug}`} className="block rounded-lg py-2 pl-3 pr-2 text-[13px] font-medium text-sky-800 transition hover:bg-sky-200/50 hover:text-sky-900">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        {REPORT_GROUPS.map((group) => (
          <div key={group.title} className="mt-1">
            <button
              type="button"
              onClick={() => toggle(group.title)}
              className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-[12px] font-semibold uppercase tracking-wide text-sky-800 hover:bg-sky-200/50"
            >
              {group.title}
              <svg className={`h-3.5 w-3.5 shrink-0 text-sky-600 transition-transform ${openGroups[group.title] ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openGroups[group.title] && (
              <ul className="space-y-0.5 border-l border-sky-200/80 ml-3 pl-2 py-1">
                {group.items.map((item) => (
                  <li key={item.slug}>
                    <Link href={`/admin/reports/${item.slug}`} className="block py-1.5 pl-1 pr-2 text-[13px] font-medium text-sky-800 transition hover:bg-sky-200/50 hover:text-sky-900">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
