import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { AdminAgentDetailClient } from "@/components/admin/AdminAgentDetailClient";

export const dynamic = "force-dynamic";

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = await db.member.findUnique({
    where: { id },
    include: {
      referrals: {
        include: {
          promoClaims: {
            where: { status: "APPROVED" },
            select: { amountGranted: true }
          }
        }
      }
    }
  });
  if (!agent) notFound();

  const l1 = agent.referrals;
  const freeCredit = (ref: { promoClaims: { amountGranted: unknown }[] }) =>
    ref.promoClaims.reduce((s, c) => s + Number(c.amountGranted ?? 0), 0);

  const l1Rows = l1.map((r) => ({
    id: r.id,
    userRef: r.userRef,
    displayName: r.displayName,
    register_at: r.createdAt.toISOString(),
    last_deposit_at: r.lastDepositAt?.toISOString() ?? null,
    free_credit: freeCredit(r),
    deposit_count: r.depositCount,
    withdraw_count: r.withdrawCount
  }));

  const snapshot = {
    userRef: agent.userRef,
    displayName: agent.displayName,
    referralCode: agent.referralCode,
  };
  const totalDepositCount = l1.reduce((s, r) => s + r.depositCount, 0);
  const totalWithdrawCount = l1.reduce((s, r) => s + r.withdrawCount, 0);

  return (
    <AdminAgentDetailClient
      agent={snapshot}
      l1Rows={l1Rows}
      totalDepositCount={totalDepositCount}
      totalWithdrawCount={totalWithdrawCount}
    />
  );
}
