import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAdminUserFromRequest(_req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await params;
  const member = await db.member.findUnique({
    where: { id },
    include: {
      walletTx: { orderBy: { happenedAt: "desc" }, take: 100 }
    }
  });
  if (!member)
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const balanceResult = await db.walletTransaction.aggregate({
    where: { memberId: id },
    _sum: { amountSigned: true }
  });
  const mainWalletBalance = Number(balanceResult._sum.amountSigned ?? 0);

  return NextResponse.json({
    id: member.id,
    userRef: member.userRef,
    displayName: member.displayName,
    mobile: member.mobile,
    bankName: member.bankName,
    bankAccount: member.bankAccount,
    referralCode: member.referralCode,
    referrerId: member.referrerId,
    agentId: member.agentId,
    createdAt: member.createdAt.toISOString(),
    lastLoginAt: member.lastLoginAt?.toISOString() ?? null,
    lastLoginIp: member.lastLoginIp,
    depositCount: member.depositCount,
    withdrawCount: member.withdrawCount,
    lastDepositAt: member.lastDepositAt?.toISOString() ?? null,
    mainWalletBalance,
    walletTx: member.walletTx.map((t) => ({
      id: t.id,
      type: t.type,
      amountSigned: Number(t.amountSigned),
      currency: t.currency,
      channel: t.channel,
      refNo: t.refNo,
      note: t.note,
      happenedAt: t.happenedAt.toISOString(),
      status: t.status
    }))
  });
}
