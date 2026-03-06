"use client";

import Link from "next/link";

const LIST_PATH = "/admin/settings/promotions/list";

export type PromotionContextPayload = {
  id: string;
  title: string;
  isActive: boolean;
};

type PromotionContextHeaderProps = {
  promotionId: string | null;
  promotion: PromotionContextPayload | null;
  loading: boolean;
  notFound: boolean;
  /** 有 promotion 时，本页名称（如 Media / Links） */
  pageLabel?: string;
};

/**
 * 单活动页统一页头：Title / ID / Status / Back to List。
 * 无 promotionId → 引导；404 → Not found；loading → 骨架；有数据 → 展示上下文。
 * Media / Links / Preview 共用，避免每页各写一套。
 */
export function PromotionContextHeader({
  promotionId,
  promotion,
  loading,
  notFound,
  pageLabel = "",
}: PromotionContextHeaderProps) {
  if (promotionId == null || promotionId.trim() === "") {
    return (
      <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6 max-w-xl">
        <p className="text-[var(--admin-muted)] mb-2">请从 List 选择活动后进入本页。</p>
        <Link
          href={LIST_PATH}
          className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--admin-primary)] hover:underline"
        >
          ← Back to List
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6 max-w-xl animate-pulse">
        <div className="h-5 w-48 bg-[var(--admin-border)] rounded mb-2" />
        <div className="h-4 w-32 bg-[var(--admin-border)] rounded mb-4" />
        <Link href={LIST_PATH} className="text-[13px] text-[var(--admin-primary)] hover:underline">
          ← Back to List
        </Link>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6 max-w-xl">
        <p className="text-[var(--admin-danger)] font-medium">Not found</p>
        <p className="text-[13px] text-[var(--admin-muted)] mt-1">该活动不存在或已删除。</p>
        <Link
          href={LIST_PATH}
          className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-[var(--admin-primary)] hover:underline"
        >
          ← Back to List
        </Link>
      </div>
    );
  }

  if (!promotion) {
    return null;
  }

  return (
    <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel)] p-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-medium text-[var(--admin-text)]">{promotion.title}</span>
        <span className="text-[12px] font-mono text-[var(--admin-muted)]">{promotion.id}</span>
        <span
          className={`inline-flex px-2 py-0.5 rounded text-[12px] ${
            promotion.isActive ? "bg-emerald-500/20 text-emerald-700" : "bg-gray-500/20 text-gray-600"
          }`}
        >
          {promotion.isActive ? "Active" : "Inactive"}
        </span>
        {pageLabel && (
          <span className="text-[12px] text-[var(--admin-muted)]">· {pageLabel}</span>
        )}
      </div>
      <Link
        href={LIST_PATH}
        className="text-[13px] font-medium text-[var(--admin-primary)] hover:underline"
      >
        ← Back to List
      </Link>
    </div>
  );
}
