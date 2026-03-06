"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";

type PromotionRow = {
  id: string;
  title: string;
  subtitle: string | null;
  coverUrl: string | null;
  percent: number;
  ctaLabel: string | null;
  ctaUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  ruleJson: unknown;
  createdAt: string;
  updatedAt: string;
};

type Response = { items: PromotionRow[]; total: number; page: number; pageSize: number };

const PAGE_SIZE = 20;

/** Promotion Center List 页：真实表格 + 启停/排序/Media/Links/Preview，行内不放 Content */
export function PromotionListSettingsClient() {
  const { t } = useLocale();
  const [data, setData] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const sp = new URLSearchParams();
    sp.set("page", String(page));
    sp.set("pageSize", String(PAGE_SIZE));
    fetch(`/api/admin/promotions?${sp}`, { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("FETCH_FAIL");
        return r.json();
      })
      .then(setData)
      .catch(() => setError(t("admin.promotionsList.loadFailed") ?? "加载失败"))
      .finally(() => setLoading(false));
  }, [page, t]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleActive(id: string, current: boolean) {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/admin/promotions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !current }),
      });
      if (!res.ok) throw new Error("PUT_FAIL");
      load();
    } catch {
      setError(t("admin.common.saveError") ?? "保存失败");
    } finally {
      setTogglingId(null);
    }
  }

  async function moveOrder(id: string, direction: "up" | "down") {
    setMovingId(id);
    try {
      const res = await fetch(`/api/admin/promotions/${id}/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ direction }),
      });
      if (!res.ok) throw new Error("REORDER_FAIL");
      load();
    } catch {
      setError(t("admin.promotionsList.reorderFailed") ?? "排序失败");
    } finally {
      setMovingId(null);
    }
  }

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      {/* 本组导航：Content / Layout 只在这里出现，不在行内 */}
      <nav className="flex flex-wrap items-center gap-2 text-[12px]">
        <span className="text-[var(--admin-muted)]">本组：</span>
        <Link href="/admin/settings/promotions/list" className="text-[var(--admin-primary)] font-medium">
          List
        </Link>
        <span className="text-[var(--admin-muted)]">·</span>
        <Link href="/admin/settings/promotion" className="text-[var(--admin-text)] hover:underline">
          Content
        </Link>
        <span className="text-[var(--admin-muted)]">·</span>
        <Link href="/admin/settings/promotions/media" className="text-[var(--admin-text)] hover:underline">
          Media
        </Link>
        <span className="text-[var(--admin-muted)]">·</span>
        <Link href="/admin/settings/promotions/links" className="text-[var(--admin-text)] hover:underline">
          Links
        </Link>
        <span className="text-[var(--admin-muted)]">·</span>
        <Link href="/admin/settings/promotions/layout" className="text-[var(--admin-text)] hover:underline">
          Layout
        </Link>
        <span className="text-[var(--admin-muted)]">·</span>
        <Link href="/admin/settings/promotions/preview" className="text-[var(--admin-text)] hover:underline">
          Preview
        </Link>
      </nav>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin/promotions/new"
          className="admin-compact-btn admin-compact-btn-primary text-[13px]"
        >
          新建活动
        </Link>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="admin-compact-btn admin-compact-btn-ghost text-[13px]"
        >
          {loading ? (t("admin.promotionsList.loading") ?? "加载中…") : (t("admin.promotionsList.refresh") ?? "刷新")}
        </button>
        {data && (
          <span className="text-[12px] text-[var(--admin-muted)]">
            共 {total} 条
          </span>
        )}
      </div>

      <div className="admin-card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-[13px] text-[var(--admin-muted)]">
            {t("admin.promotionsList.loading") ?? "加载中…"}
          </div>
        ) : error ? (
          <div className="py-16 text-center text-[13px] text-[var(--admin-danger)]">{error}</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-[13px] text-[var(--admin-muted)]">
            {t("admin.promotionsList.noPromotions") ?? "暂无活动"}
            <div className="mt-2">
              <Link href="/admin/promotions/new" className="text-[var(--admin-primary)] underline">
                新建活动
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table w-full">
              <thead>
                <tr>
                  <th className="text-left py-2 px-3 text-[12px] font-semibold text-[var(--admin-muted)]">Title</th>
                  <th className="text-left py-2 px-3 text-[12px] font-semibold text-[var(--admin-muted)]">Status</th>
                  <th className="text-left py-2 px-3 text-[12px] font-semibold text-[var(--admin-muted)]">Sort</th>
                  <th className="text-left py-2 px-3 text-[12px] font-semibold text-[var(--admin-muted)]">Updated</th>
                  <th className="text-right py-2 px-3 text-[12px] font-semibold text-[var(--admin-muted)]">操作</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p, idx) => (
                  <tr key={p.id} className="border-t border-[var(--admin-border)] hover:bg-[var(--admin-panel2)]/50">
                    <td className="py-2 px-3">
                      <Link
                        href={`/admin/promotions/${p.id}/edit`}
                        className="font-medium text-[var(--admin-text)] hover:underline max-w-[200px] truncate block"
                      >
                        {p.title}
                      </Link>
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[12px] ${
                          p.isActive
                            ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                            : "bg-gray-500/20 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {p.isActive ? "启用" : "停用"}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-[12px] text-[var(--admin-muted)] tabular-nums">{p.sortOrder}</td>
                    <td className="py-2 px-3 text-[12px] text-[var(--admin-muted)] tabular-nums">
                      {p.updatedAt
                        ? new Date(p.updatedAt).toLocaleString("zh-CN", { dateStyle: "short", timeStyle: "short" })
                        : "—"}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        <button
                          type="button"
                          disabled={togglingId === p.id}
                          onClick={() => toggleActive(p.id, p.isActive)}
                          className="admin-compact-btn admin-compact-btn-ghost text-[11px] py-1 px-2"
                        >
                          {togglingId === p.id ? "…" : p.isActive ? "停用" : "启用"}
                        </button>
                        <button
                          type="button"
                          title="上移"
                          disabled={idx === 0 || movingId === p.id}
                          onClick={() => moveOrder(p.id, "up")}
                          className="admin-compact-btn admin-compact-btn-ghost text-[11px] py-1 px-1.5"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          title="下移"
                          disabled={idx === items.length - 1 || movingId === p.id}
                          onClick={() => moveOrder(p.id, "down")}
                          className="admin-compact-btn admin-compact-btn-ghost text-[11px] py-1 px-1.5"
                        >
                          ↓
                        </button>
                        <Link
                          href={`/admin/settings/promotions/media?promotionId=${encodeURIComponent(p.id)}`}
                          className="admin-compact-btn admin-compact-btn-ghost text-[11px] py-1 px-2"
                        >
                          Media
                        </Link>
                        <Link
                          href={`/admin/settings/promotions/links?promotionId=${encodeURIComponent(p.id)}`}
                          className="admin-compact-btn admin-compact-btn-ghost text-[11px] py-1 px-2"
                        >
                          Links
                        </Link>
                        <Link
                          href={`/admin/settings/promotions/preview?promotionId=${encodeURIComponent(p.id)}`}
                          className="admin-compact-btn admin-compact-btn-ghost text-[11px] py-1 px-2"
                        >
                          Preview
                        </Link>
                        <Link
                          href={`/admin/promotions/${p.id}/edit`}
                          className="admin-compact-btn admin-compact-btn-ghost text-[11px] py-1 px-2"
                        >
                          编辑
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--admin-border)] px-4 py-2 text-[12px] text-[var(--admin-muted)]">
            <span>
              第 {page} / {totalPages} 页
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((x) => Math.max(1, x - 1))}
                className="admin-compact-btn admin-compact-btn-ghost text-[12px] py-1"
              >
                上一页
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((x) => Math.min(totalPages, x + 1))}
                className="admin-compact-btn admin-compact-btn-ghost text-[12px] py-1"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
