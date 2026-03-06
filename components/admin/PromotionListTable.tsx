"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";

export type PromotionListRow = {
  id: string;
  title: string;
  subtitle: string | null;
  isActive: boolean;
  sortOrder: number;
  updatedAt: string;
};

type PromotionListTableProps = {
  items: PromotionListRow[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
  togglingId: string | null;
  movingId: string | null;
  onRetry: () => void;
  onToggle: (id: string, current: boolean) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onPageChange: (page: number) => void;
};

/** 表格主体：Title / Status / Sort / Updated + Actions。Loading / Empty / Error 三态。 */
export function PromotionListTable({
  items,
  loading,
  error,
  total,
  page,
  totalPages,
  togglingId,
  movingId,
  onRetry,
  onToggle,
  onMove,
  onPageChange,
}: PromotionListTableProps) {
  const { t } = useLocale();

  if (loading) {
    return (
      <div className="admin-card overflow-hidden">
        <div className="py-16 text-center text-[13px] text-[var(--admin-muted)]">
          {t("admin.promotionsList.loading") ?? "加载中…"}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-card overflow-hidden">
        <div className="py-16 text-center">
          <p className="text-[13px] text-[var(--admin-danger)]">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 admin-compact-btn admin-compact-btn-primary text-[13px]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="admin-card overflow-hidden">
        <div className="py-16 text-center text-[13px] text-[var(--admin-muted)]">
          {t("admin.promotionsList.noPromotions") ?? "暂无活动"}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <Link href="/admin/promotions/new" className="admin-compact-btn admin-compact-btn-primary text-[13px]">
              Create promotion
            </Link>
            <Link href="/admin/promotions" className="admin-compact-btn admin-compact-btn-ghost text-[13px]">
              Go to old promotions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusBadge = (p: PromotionListRow) => (
    <span
      className={`inline-flex px-2 py-0.5 rounded text-[12px] ${
        p.isActive ? "bg-emerald-500/20 text-emerald-700" : "bg-gray-500/20 text-gray-600"
      }`}
    >
      {p.isActive ? "Enabled" : "Disabled"}
    </span>
  );

  const actionButtons = (p: PromotionListRow, idx: number) => (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        disabled={togglingId === p.id}
        onClick={() => onToggle(p.id, p.isActive)}
        className="admin-compact-btn admin-compact-btn-ghost text-[11px] py-1 px-2 min-h-[32px]"
      >
        {togglingId === p.id ? "…" : p.isActive ? "Disable" : "Enable"}
      </button>
      <button
        type="button"
        title="上移"
        disabled={idx === 0 || movingId === p.id}
        onClick={() => onMove(p.id, "up")}
        className="admin-compact-btn admin-compact-btn-ghost text-[11px] py-1 px-1.5 min-h-[32px]"
      >
        ↑
      </button>
      <button
        type="button"
        title="下移"
        disabled={idx === items.length - 1 || movingId === p.id}
        onClick={() => onMove(p.id, "down")}
        className="admin-compact-btn admin-compact-btn-ghost text-[11px] py-1 px-1.5 min-h-[32px]"
      >
        ↓
      </button>
      <Link
        href={`/admin/settings/promotions/media?promotionId=${encodeURIComponent(p.id)}`}
        className="admin-compact-btn admin-compact-btn-ghost text-[11px] py-1 px-2 min-h-[32px]"
      >
        Media
      </Link>
      <Link
        href={`/admin/settings/promotions/links?promotionId=${encodeURIComponent(p.id)}`}
        className="admin-compact-btn admin-compact-btn-ghost text-[11px] py-1 px-2 min-h-[32px]"
      >
        Links
      </Link>
      <Link
        href={`/admin/settings/promotions/preview?promotionId=${encodeURIComponent(p.id)}`}
        className="admin-compact-btn admin-compact-btn-ghost text-[11px] py-1 px-2 min-h-[32px]"
      >
        Preview
      </Link>
      <Link
        href={`/admin/promotions/${p.id}/edit`}
        className="admin-compact-btn admin-compact-btn-ghost text-[11px] py-1 px-2 min-h-[32px]"
      >
        Edit
      </Link>
    </div>
  );

  return (
    <div className="admin-card overflow-hidden">
      {/* 电话版：卡片列表 */}
      <div className="promo-list-cards space-y-3 p-3 md:hidden">
        {items.map((p, idx) => (
          <div
            key={p.id}
            className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel)] p-3 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <Link
                href={`/admin/promotions/${p.id}/edit`}
                className="min-w-0 flex-1 font-medium text-[var(--admin-text)] hover:underline"
              >
                <span className="line-clamp-2">{p.title}</span>
              </Link>
              {statusBadge(p)}
            </div>
            <div className="mt-2 flex items-center gap-3 text-[12px] text-[var(--admin-muted)] tabular-nums">
              <span>Sort {p.sortOrder}</span>
              <span>
                {p.updatedAt
                  ? new Date(p.updatedAt).toLocaleString("zh-CN", { dateStyle: "short", timeStyle: "short" })
                  : "—"}
              </span>
            </div>
            <div className="mt-3 border-t border-[var(--admin-border)] pt-2">{actionButtons(p, idx)}</div>
          </div>
        ))}
      </div>

      {/* 桌面版：表格 */}
      <div className="hidden overflow-x-auto md:block">
        <table className="admin-table w-full">
          <thead>
            <tr>
              <th className="text-left py-2 px-3 text-[12px] font-semibold text-[var(--admin-muted)]">Title</th>
              <th className="text-left py-2 px-3 text-[12px] font-semibold text-[var(--admin-muted)]">Status</th>
              <th className="text-left py-2 px-3 text-[12px] font-semibold text-[var(--admin-muted)]">Sort</th>
              <th className="text-left py-2 px-3 text-[12px] font-semibold text-[var(--admin-muted)]">Updated</th>
              <th className="text-right py-2 px-3 text-[12px] font-semibold text-[var(--admin-muted)]">Actions</th>
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
                <td className="py-2 px-3">{statusBadge(p)}</td>
                <td className="py-2 px-3 text-[12px] text-[var(--admin-muted)] tabular-nums">{p.sortOrder}</td>
                <td className="py-2 px-3 text-[12px] text-[var(--admin-muted)] tabular-nums">
                  {p.updatedAt
                    ? new Date(p.updatedAt).toLocaleString("zh-CN", { dateStyle: "short", timeStyle: "short" })
                    : "—"}
                </td>
                <td className="py-2 px-3 text-right">{actionButtons(p, idx)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--admin-border)] px-3 py-2.5 text-[12px] text-[var(--admin-muted)] md:px-4">
          <span>第 {page} / {totalPages} 页 · 共 {total} 条</span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(Math.max(1, page - 1))}
              className="admin-compact-btn admin-compact-btn-ghost min-h-[36px] text-[12px] py-1"
            >
              上一页
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              className="admin-compact-btn admin-compact-btn-ghost min-h-[36px] text-[12px] py-1"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
