"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

/** Media 入口：有 promotionId 时跳转到该活动的编辑页，否则提示在列表行内操作 */
export default function PromotionMediaPage() {
  const searchParams = useSearchParams();
  const promotionId = searchParams.get("promotionId");

  useEffect(() => {
    if (promotionId) {
      window.location.href = `/admin/promotions/${encodeURIComponent(promotionId)}/edit`;
    }
  }, [promotionId]);

  if (promotionId) {
    return (
      <div className="p-4 text-sm text-[var(--admin-muted)]">
        正在跳转到活动编辑…
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-3 p-4">
      <h1 className="text-lg font-semibold text-[var(--admin-text)]">Media</h1>
      <p className="text-sm text-[var(--admin-muted)]">
        请在 <Link href="/admin/settings/promotions/list" className="text-[var(--admin-primary)] underline">Promotion List</Link> 中点击某一活动的「Media」或「编辑」进入该活动的媒体与内容编辑。
      </p>
      <Link href="/admin/settings/promotions/list" className="admin-compact-btn admin-compact-btn-primary text-[13px]">
        返回活动列表
      </Link>
    </div>
  );
}
