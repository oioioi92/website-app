import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ensureInternalTestMode } from "@/lib/internal-test";
import { canClaim, calculateGrant, recordClaim } from "@/lib/promo/engine";
import { checkPromoPublicRateLimit } from "@/lib/promo/abuse-guard";
import { writePromotionClaimAttempt } from "@/lib/promo/attempt";
import { getClientIp } from "@/lib/net/clientIp";

const confirmSchema = z.object({
  baseAmount: z.coerce.number().min(0)
});

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const gate = ensureInternalTestMode();
  if (gate) return gate;

  const userRef = req.cookies.get("member_ref")?.value;
  if (!userRef) return NextResponse.json({ error: "NO_MEMBER_SESSION" }, { status: 401 });
  const member = await db.member.findUnique({ where: { userRef }, select: { id: true, userRef: true } });
  if (!member) return NextResponse.json({ error: "MEMBER_NOT_FOUND" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = confirmSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });

  const { id } = await params;
  const promo = await db.promotion.findUnique({
    where: { id },
    select: { id: true, isActive: true, isClaimable: true, startAt: true, endAt: true, percent: true, ruleJson: true }
  });
  if (!promo) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const ip = getClientIp(req.headers);
  const guard = checkPromoPublicRateLimit({
    ip,
    memberRef: member.userRef,
    promotionId: promo.id
  });
  if (!guard.ok) {
    await writePromotionClaimAttempt({
      promotionId: promo.id,
      memberId: member.id,
      ok: false,
      reason: "RATE_LIMITED",
      req
    });
    return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
  }

  const check = await canClaim(promo, member.id, new Date());
  if (!check.ok) {
    await writePromotionClaimAttempt({
      promotionId: promo.id,
      memberId: member.id,
      ok: false,
      reason: check.reason,
      req
    });
    return NextResponse.json(
      {
        ok: false,
        reason: check.reason,
        nextEligibleAt: check.nextEligibleAt ? check.nextEligibleAt.toISOString() : null
      },
      { status: 400 }
    );
  }

  const grant = calculateGrant(promo, parsed.data.baseAmount);
  const claim = await recordClaim({
    promotionId: promo.id,
    memberId: member.id,
    status: "APPROVED",
    amountGranted: grant,
    metaJson: {
      source: "PUBLIC_INTERNAL_TEST",
      baseAmount: parsed.data.baseAmount,
      memberRef: member.userRef
    }
  });

  await writePromotionClaimAttempt({
    promotionId: promo.id,
    memberId: member.id,
    ok: true,
    reason: "OK",
    req
  });

  return NextResponse.json({ ok: true, claimId: claim.id, grantedAmount: grant.toFixed(2) });
}
