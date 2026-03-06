"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";

type TransferItem = {
  id: string;
  fromUserId?: string;
  toUserId?: string;
  amount: number;
  status: string;
  createdAt?: string;
  correlationId?: string;
};

type TransfersResponse = {
  items: TransferItem[];
  total: number;
};

export function TransfersPageClient() {
  const { t } = useLocale();
  const [data, setData] = useState<TransfersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/api/admin/transfers")
      .then((r) => {
        if (!r.ok) throw new Error(t("admin.transfers.requestError"));
        return r.json();
      })
      .then((d: TransfersResponse) => setData(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/transactions?preset=transfer" className="admin-compact-btn admin-compact-btn-primary">
          {t("admin.transfers.viewFlow")}
        </Link>
      </div>
      <div className="admin-card overflow-hidden">
        <div className="border-b border-[var(--compact-table-border)] px-4 py-2 flex items-center justify-between bg-[var(--compact-table-header)]">
          <span className="text-[13px] font-semibold text-[var(--compact-text)]">{t("admin.transfers.queueTitle")}</span>
          {data && <span className="text-xs text-[var(--compact-muted)]">{t("admin.transfers.totalCount").replace("{n}", String(total))}</span>}
        </div>
        {loading ? (
          <div className="py-12 text-center text-[13px] text-[var(--compact-muted)]">{t("admin.common.loading")}</div>
        ) : error ? (
          <div className="py-12 text-center text-[13px] text-[var(--compact-danger)]">{error}</div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-[13px] text-[var(--compact-muted)]">{t("admin.transfers.noRecords")}</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("admin.transfers.time")}</th>
                <th>{t("admin.transfers.from")}</th>
                <th>{t("admin.transfers.to")}</th>
                <th className="num">{t("admin.transfers.amount")}</th>
                <th>{t("admin.reports.status")}</th>
                <th>{t("admin.transfers.correlationId")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id}>
                  <td>{row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"}</td>
                  <td>{row.fromUserId ?? "—"}</td>
                  <td>{row.toUserId ?? "—"}</td>
                  <td className="num">{Number(row.amount).toFixed(2)}</td>
                  <td>{row.status}</td>
                  <td>{row.correlationId ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
