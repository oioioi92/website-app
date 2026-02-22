"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PromotionItem = {
  id: string;
  title: string;
  subtitle: string | null;
  coverUrl: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
};

type Response = { items: PromotionItem[]; total: number; page: number; pageSize: number };

export function PromotionsPageClient() {
  const [data, setData] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeOnly, setActiveOnly] = useState(false);

  function load() {
    setLoading(true);
    setError(null);
    const sp = new URLSearchParams();
    if (activeOnly) sp.set("active", "1");
    fetch(`/api/admin/promotions?${sp}`)
      .then((r) => {
        if (!r.ok) throw new Error("加载失败");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [activeOnly]);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-[13px] text-[var(--compact-text)]">
          <input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} className="rounded border-[var(--compact-card-border)]" />
          仅显示启用
        </label>
        <button type="button" onClick={load} disabled={loading} className="admin-compact-btn admin-compact-btn-ghost text-[13px]">
          {loading ? "加载中…" : "刷新"}
        </button>
      </div>
      <div className="admin-card overflow-hidden">
        <div className="border-b border-[var(--compact-table-border)] px-4 py-2 flex items-center justify-between bg-[var(--compact-table-header)]">
          <span className="text-[13px] font-semibold text-[var(--compact-text)]">优惠列表</span>
          {data && <span className="text-xs text-[var(--compact-muted)]">共 {total} 条</span>}
        </div>
        {loading ? (
          <div className="py-12 text-center text-[13px] text-[var(--compact-muted)]">加载中…</div>
        ) : error ? (
          <div className="py-12 text-center text-[13px] text-[var(--compact-danger)]">{error}</div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-[13px] text-[var(--compact-muted)]">暂无优惠活动</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>标题</th>
                <th>副标题</th>
                <th>CTA</th>
                <th>启用</th>
                <th>排序</th>
                <th>创建时间</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td className="font-medium">{p.title}</td>
                  <td className="text-[var(--compact-muted)]">{p.subtitle ?? "—"}</td>
                  <td>{p.ctaLabel ?? "—"}</td>
                  <td>{p.isActive ? "是" : "否"}</td>
                  <td>{p.sortOrder}</td>
                  <td>{p.createdAt ? new Date(p.createdAt).toLocaleString() : "—"}</td>
                  <td className="flex items-center gap-2">
                    <Link href={`/admin/promotions/${p.id}/edit`} className="text-[13px] text-[var(--compact-primary)] hover:underline">
                      编辑
                    </Link>
                    <span className="text-[var(--compact-muted)]">|</span>
                    <Link href={`/promotion/${p.id}`} target="_blank" rel="noreferrer" className="text-[13px] text-[var(--compact-primary)] hover:underline">
                      前台查看
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
