"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";
import { useAdminApiContext } from "@/lib/admin-api-context";
import { PromotionListTable, type PromotionListRow } from "@/components/admin/PromotionListTable";

type ApiRow = PromotionListRow & {
  coverUrl: string | null;
  percent: number;
  ctaLabel: string | null;
  ctaUrl: string | null;
  ruleJson: unknown;
  createdAt: string;
};

type Response = { items: ApiRow[]; total: number; page: number; pageSize: number };

const PAGE_SIZE = 20;
const TOAST_MS = 2500;

/** Promotion Center List：拉数 + 本组导航 + 工具栏 + PromotionListTable。行内无 Content。 */
export function PromotionListSettingsClient() {
  const { t } = useLocale();
  const { setForbidden } = useAdminApiContext();
  const [data, setData] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [toast, setToast] = useState<"success" | "error" | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const sp = new URLSearchParams();
    sp.set("page", String(page));
    sp.set("pageSize", String(PAGE_SIZE));
    fetch(`/api/admin/promotions?${sp}`, { credentials: "include" })
      .then((r) => {
        if (r.status === 403) setForbidden(true);
        if (!r.ok) throw new Error("FETCH_FAIL");
        return r.json();
      })
      .then(setData)
      .catch(() => setError(t("admin.promotionsList.loadFailed") ?? "加载失败"))
      .finally(() => setLoading(false));
  }, [page, t, setForbidden]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (toast == null) return;
    const id = setTimeout(() => {
      setToast(null);
      setToastMessage("");
    }, TOAST_MS);
    return () => clearTimeout(id);
  }, [toast]);

  async function toggleActive(id: string, current: boolean) {
    setTogglingId(id);
    setToast(null);
    try {
      const res = await fetch(`/api/admin/promotions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !current }),
      });
      if (res.status === 403) setForbidden(true);
      if (!res.ok) throw new Error("PUT_FAIL");
      load();
      setToast("success");
      setToastMessage(!current ? "已启用" : "已停用");
    } catch {
      setError(t("admin.common.saveError") ?? "保存失败");
      setToast("error");
      setToastMessage(t("admin.common.saveError") ?? "保存失败");
    } finally {
      setTogglingId(null);
    }
  }

  async function moveOrder(id: string, direction: "up" | "down") {
    setMovingId(id);
    setToast(null);
    try {
      const res = await fetch(`/api/admin/promotions/${id}/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ direction }),
      });
      if (res.status === 403) setForbidden(true);
      if (!res.ok) throw new Error("REORDER_FAIL");
      load();
      setToast("success");
      setToastMessage("顺序已更新");
    } catch {
      setError(t("admin.promotionsList.reorderFailed") ?? "排序失败");
      setToast("error");
      setToastMessage(t("admin.promotionsList.reorderFailed") ?? "排序失败");
    } finally {
      setMovingId(null);
    }
  }

  const items: PromotionListRow[] = (data?.items ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    subtitle: p.subtitle,
    isActive: p.isActive,
    sortOrder: p.sortOrder,
    updatedAt: p.updatedAt,
  }));
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      {/* 本组导航：Content / Layout 只在这里，不在行内 */}
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
        <Link href="/admin/promotions/new" className="admin-compact-btn admin-compact-btn-primary text-[13px]">
          新建活动
        </Link>
        <button type="button" onClick={load} disabled={loading} className="admin-compact-btn admin-compact-btn-ghost text-[13px]">
          {loading ? (t("admin.promotionsList.loading") ?? "加载中…") : (t("admin.promotionsList.refresh") ?? "刷新")}
        </button>
        {data != null && <span className="text-[12px] text-[var(--admin-muted)]">共 {total} 条</span>}
        {toast != null && (
          <span className={`text-[13px] ${toast === "success" ? "text-[var(--admin-success)]" : "text-[var(--admin-danger)]"}`}>
            {toastMessage}
          </span>
        )}
      </div>

      <PromotionListTable
        items={items}
        loading={loading}
        error={error}
        total={total}
        page={page}
        totalPages={totalPages}
        togglingId={togglingId}
        movingId={movingId}
        onRetry={load}
        onToggle={toggleActive}
        onMove={moveOrder}
        onPageChange={setPage}
      />
    </div>
  );
}
