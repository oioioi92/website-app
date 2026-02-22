import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureInternalTestMode } from "@/lib/internal-test";

export async function GET(req: NextRequest) {
  const gate = ensureInternalTestMode();
  if (gate) return gate;

  const userRef = req.cookies.get("member_ref")?.value;
  if (!userRef) return NextResponse.json({ claims: [] });

  const member = await db.member.findUnique({ where: { userRef }, select: { id: true, userRef: true } });
  if (!member) return NextResponse.json({ claims: [] });

  const claims = await db.promotionClaim.findMany({
    where: { memberId: member.id },
    include: {
      promotion: { select: { id: true, title: true } }
    },
    orderBy: { claimedAt: "desc" },
    take: 20
  });

  return NextResponse.json({
    memberRef: member.userRef,
    claims: claims.map((c) => ({
      id: c.id,
      promotionId: c.promotionId,
      promotionTitle: c.promotion.title,
      status: c.status,
      amountGranted: c.amountGranted?.toFixed(2) ?? null,
      claimedAt: c.claimedAt.toISOString()
    }))
  });
}
