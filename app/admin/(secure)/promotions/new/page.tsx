import Link from "next/link";
import { PromotionEditClient } from "@/components/admin/PromotionEditClient";

export const dynamic = "force-dynamic";

export default function AdminPromotionNewPage() {
  return (
    <div>
      <nav className="flex items-center gap-2 text-[13px] text-[var(--admin-muted)]">
        <Link href="/admin/promotions" className="hover:text-[var(--admin-primary)]">优惠活动</Link>
        <span aria-hidden>/</span>
        <span className="text-[var(--admin-text)]">新建</span>
      </nav>
      <h1 className="mt-3 text-lg font-semibold text-[var(--admin-text)]">新建优惠</h1>
      <p className="mt-1 text-[13px] text-[var(--admin-muted)]">填写标题与规则，创建后可在列表中编辑</p>
      <PromotionEditClient />
    </div>
  );
}
