import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

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
  if (!agent) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const l1 = agent.referrals.map((r) => {
    const freeCredit = r.promoClaims.reduce((s, c) => s + Number(c.amountGranted ?? 0), 0);
    return {
      id: r.id,
      userRef: r.userRef,
      displayName: r.displayName,
      register_at: r.createdAt.toISOString(),
      last_deposit_at: r.lastDepositAt?.toISOString() ?? null,
      free_credit: freeCredit,
      deposit_count: r.depositCount,
      withdraw_count: r.withdrawCount
    };
  });

  const depositTotal = l1.reduce((s, r) => s + r.deposit_count, 0);
  const withdrawTotal = l1.reduce((s, r) => s + r.withdraw_count, 0);
  const memberIds = l1.map((r) => r.id);
  const bonusRecords =
    memberIds.length > 0
      ? await db.promotionClaim.findMany({
          where: { memberId: { in: memberIds }, status: "APPROVED" },
          include: {
            promotion: { select: { title: true } },
            member: { select: { userRef: true, displayName: true } }
          },
          orderBy: { claimedAt: "desc" },
          take: 200
        })
      : [];

  return NextResponse.json({
    agent: {
      id: agent.id,
      userRef: agent.userRef,
      displayName: agent.displayName,
      referralCode: agent.referralCode
    },
    level1: l1,
    summary: {
      directCount: l1.length,
      depositTotal,
      withdrawTotal
    },
    promotionBonusRecords: bonusRecords.map((c) => ({
      id: c.id,
      memberId: c.memberId,
      memberUserRef: c.member.userRef,
      promotionTitle: c.promotion.title,
      amountGranted: Number(c.amountGranted ?? 0),
      claimedAt: c.claimedAt.toISOString()
    }))
  });
}
