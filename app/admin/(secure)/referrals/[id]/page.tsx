import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminReferralTreeClient } from "@/components/admin/AdminReferralTreeClient";
import { db } from "@/lib/db";

type Props = { params: Promise<{ id: string }> };

export default async function ReferralDownlinePage({ params }: Props) {
  const { id } = await params;
  const root = await db.member.findUnique({
    where: { id },
    select: { id: true, userRef: true, displayName: true },
  });
  if (!root) notFound();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin/referrals"
          className="text-[13px] font-medium text-[var(--admin-primary)] hover:underline"
        >
          ← 返回推荐列表
        </Link>
        <span className="text-[var(--admin-muted)]">|</span>
        <h1 className="text-lg font-semibold text-[var(--admin-text)]">
          下线：{root.displayName || root.userRef}
          <span className="ml-2 font-mono text-sm font-normal text-[var(--admin-muted)]">
            ({root.userRef})
          </span>
        </h1>
      </div>
      <AdminReferralTreeClient rootId={id} />
    </div>
  );
}
