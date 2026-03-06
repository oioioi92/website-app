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
      {/* 本组导航：电话版美化为圆角标签栏 */}
      <nav
        className="promo-list-nav rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel)] px-3 py-2.5 md:px-4 md:py-2"
        aria-label="本组"
      >
        <span className="mr-2 hidden text-[12px] text-[var(--admin-muted)] md:inline">本组：</span>
        <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
          <Link
            href="/admin/settings/promotions/list"
            className="rounded-lg bg-[var(--admin-primary)] px-3 py-1.5 text-[12px] font-medium text-white shadow-sm md:rounded-md md:px-2.5 md:py-1"
          >
            List
          </Link>
          <Link
            href="/admin/settings/promotion"
            className="rounded-lg px-3 py-1.5 text-[12px] text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-panel2)] md:rounded-md md:px-2.5 md:py-1 md:hover:underline"
          >
            Content
          </Link>
          <Link
            href="/admin/settings/promotions/media"
            className="rounded-lg px-3 py-1.5 text-[12px] text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-panel2)] md:rounded-md md:px-2.5 md:py-1 md:hover:underline"
          >
            Media
          </Link>
          <Link
            href="/admin/settings/promotions/links"
            className="rounded-lg px-3 py-1.5 text-[12px] text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-panel2)] md:rounded-md md:px-2.5 md:py-1 md:hover:underline"
          >
            Links
          </Link>
          <Link
            href="/admin/settings/promotions/layout"
            className="rounded-lg px-3 py-1.5 text-[12px] text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-panel2)] md:rounded-md md:px-2.5 md:py-1 md:hover:underline"
          >
            Layout
          </Link>
          <Link
            href="/admin/settings/promotions/preview"
            className="rounded-lg px-3 py-1.5 text-[12px] text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-panel2)] md:rounded-md md:px-2.5 md:py-1 md:hover:underline"
          >
            Preview
          </Link>
        </div>
      </nav>

      {/* 工具栏：电话版更紧凑、触控友好 */}
      <div className="promo-list-toolbar flex flex-wrap items-center gap-2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel)] px-3 py-2.5 md:rounded-lg md:gap-3 md:px-0 md:py-0 md:border-0 md:bg-transparent">
        <Link
          href="/admin/promotions/new"
          className="admin-compact-btn admin-compact-btn-primary min-h-[40px] flex-1 basis-0 text-[13px] sm:flex-none sm:basis-auto"
        >
          新建活动
        </Link>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="admin-compact-btn admin-compact-btn-ghost min-h-[40px] shrink-0 text-[13px]"
        >
          {loading ? (t("admin.promotionsList.loading") ?? "加载中…") : (t("admin.promotionsList.refresh") ?? "刷新")}
        </button>
        {data != null && (
          <span className="w-full shrink-0 text-[12px] text-[var(--admin-muted)] md:w-auto">共 {total} 条</span>
        )}
        {toast != null && (
          <span className={`shrink-0 text-[13px] ${toast === "success" ? "text-[var(--admin-success)]" : "text-[var(--admin-danger)]"}`}>
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
