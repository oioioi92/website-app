import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { AdminPlayerWalletClient } from "@/components/admin/AdminPlayerWalletClient";

export const dynamic = "force-dynamic";

export default async function PlayerWalletPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await db.member.findUnique({
    where: { id },
    include: {
      walletTx: { orderBy: { happenedAt: "desc" }, take: 50 }
    }
  });
  if (!member) notFound();

  const balanceResult = await db.walletTransaction.aggregate({
    where: { memberId: id },
    _sum: { amountSigned: true }
  });
  const balance = Number(balanceResult._sum.amountSigned ?? 0);

  const snapshot = {
    userRef: member.userRef,
    walletTx: member.walletTx.map((t) => ({
      id: t.id,
      type: t.type,
      amountSigned: Number(t.amountSigned),
      channel: t.channel,
      refNo: t.refNo,
      happenedAt: t.happenedAt.toISOString(),
    })),
  };

  return <AdminPlayerWalletClient member={snapshot} balance={balance} />;
}
