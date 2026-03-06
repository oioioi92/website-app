"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n/context";

type Row = { id: string; email: string; createdAt: string; expiresAt: string };

export function LoginHistoryClient() {
  const { t } = useLocale();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings/login-history", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("load"))))
      .then((data: { rows?: Row[] }) => setRows(Array.isArray(data.rows) ? data.rows : []))
      .catch(() => setError("admin.common.loadError"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-[13px] text-slate-500">{t("admin.common.loading")}</div>;
  if (error) return <div className="text-[13px] text-red-600">{t(error)}</div>;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-700">登录记录（Session）</h2>
        <p className="mt-0.5 text-xs text-slate-500">最近 100 条管理员会话创建时间，即登录时间</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100 text-left">
              <th className="px-4 py-2 font-semibold text-slate-700">邮箱</th>
              <th className="px-4 py-2 font-semibold text-slate-700">登录时间</th>
              <th className="px-4 py-2 font-semibold text-slate-700">过期时间</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-slate-400">
                  {t("admin.common.noRecords")}
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-2 text-slate-800">{r.email}</td>
                  <td className="px-4 py-2 text-slate-600">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2 text-slate-500 text-xs">{new Date(r.expiresAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
