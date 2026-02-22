import { TransfersPageClient } from "@/components/admin/TransfersPageClient";

export const dynamic = "force-dynamic";

export default function AdminTransfersPage() {
  return (
    <div>
      <h1 className="text-lg font-semibold text-[var(--compact-text)]">Transfer Queue</h1>
      <p className="mt-0.5 text-[13px] text-[var(--compact-muted)]">转分排队 / 卡单处理 · 待处理记录与转分流水入口</p>
      <TransfersPageClient />
    </div>
  );
}
