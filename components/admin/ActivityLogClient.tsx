"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n/context";
import { useAdminApiContext } from "@/lib/admin-api-context";

type Row = { id: string; time: string; staff: string; ip: string; userAgent: string };

export function ActivityLogClient() {
  const { t } = useLocale();
  const { setForbidden } = useAdminApiContext();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings/activity-log", { credentials: "include" })
      .then((r) => {
        if (r.status === 403) setForbidden(true);
        return r.ok ? r.json() : Promise.reject(new Error("load"));
      })
      .then((data: { rows?: Row[] }) => setRows(Array.isArray(data.rows) ? data.rows : []))
      .catch(() => setError("admin.common.loadError"))
      .finally(() => setLoading(false));
  }, [setForbidden]);

  if (loading) return <div className="text-[13px] text-slate-500">{t("admin.common.loading")}</div>;
  if (error) return <div className="text-[13px] text-red-600">{t(error)}</div>;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100 text-left">
              <th className="px-4 py-2 font-semibold text-slate-700">TIME</th>
              <th className="px-4 py-2 font-semibold text-slate-700">STAFF</th>
              <th className="px-4 py-2 font-semibold text-slate-700">IP Address</th>
              <th className="px-4 py-2 font-semibold text-slate-700">USER AGENT</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400">
                  No records. Login again to record IP and User Agent.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="whitespace-nowrap px-4 py-2 text-slate-600">
                    {new Date(r.time).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 font-medium text-slate-800">{r.staff}</td>
                  <td className="max-w-[140px] truncate px-4 py-2 text-slate-600" title={r.ip}>
                    {r.ip || "-"}
                  </td>
                  <td className="max-w-[280px] truncate px-4 py-2 text-xs text-slate-500" title={r.userAgent}>
                    {r.userAgent || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
