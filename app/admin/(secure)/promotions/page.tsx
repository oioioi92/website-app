import { PromotionsPageClient } from "@/components/admin/PromotionsPageClient";

export const dynamic = "force-dynamic";

export default function AdminPromotionsPage() {
  return (
    <div>
      <h1 className="text-lg font-semibold text-[var(--compact-text)]">Promotions</h1>
      <p className="mt-0.5 text-[13px] text-[var(--compact-muted)]">优惠活动列表、上下架、前台展示</p>
      <PromotionsPageClient />
    </div>
  );
}
