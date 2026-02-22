"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { TxPreset } from "@/config/transactions.presets";
import { ReportTableFromApi } from "@/components/admin/ReportTableFromApi";

export function TransactionsPageClient({ presets }: { presets: TxPreset[] }) {
  const searchParams = useSearchParams();
  const presetKey = searchParams.get("preset") || "all";
  const current = presets.find((p) => p.key === presetKey) || presets[0];
  const extraParams: Record<string, string> = {};
  Object.entries(current.defaultFilters).forEach(([k, v]) => {
    extraParams[k] = Array.isArray(v) ? v.join(",") : String(v);
  });

  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-wrap gap-1 border-b border-[var(--compact-card-border)] pb-2">
        {presets.map((p) => (
          <Link
            key={p.key}
            href={"/admin/transactions?preset=" + p.key}
            className={`admin-compact-btn admin-compact-btn-ghost rounded-md px-3 text-[13px] ${
              presetKey === p.key ? "bg-[var(--compact-sb-active)] text-white border-[var(--compact-primary)]" : ""
            }`}
            title={p.tooltip}
          >
            {p.label}
          </Link>
        ))}
      </div>
      <ReportTableFromApi reportKey="ledger-transactions" title="Ledger" extraParams={extraParams} />
    </div>
  );
}
