import Link from "next/link";
import { PromotionEditClient } from "@/components/admin/PromotionEditClient";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminPromotionEditPage({ params }: Props) {
  const { id } = await params;
  return (
    <div>
      <div className="flex items-center gap-2 text-[13px] text-[var(--compact-muted)]">
        <Link href="/admin/promotions" className="hover:text-[var(--compact-primary)]">Promotions</Link>
        <span>/</span>
        <span>编辑</span>
      </div>
      <h1 className="mt-2 text-lg font-semibold text-[var(--compact-text)]">编辑优惠</h1>
      <p className="mt-0.5 text-[13px] text-[var(--compact-muted)]">修改标题、副标题、封面、详情、CTA、启用与排序</p>
      <PromotionEditClient id={id} />
    </div>
  );
}
