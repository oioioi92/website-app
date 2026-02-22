import type { NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function writePromotionClaimAttempt(input: {
  promotionId: string;
  memberId?: string | null;
  ok: boolean;
  reason?: string | null;
  req?: NextRequest;
}) {
  if ((process.env.INTERNAL_TEST_MODE ?? "0") !== "1") return;
  await db.promotionClaimAttempt.create({
    data: {
      promotionId: input.promotionId,
      memberId: input.memberId ?? null,
      ok: input.ok,
      reason: input.reason ?? null,
      ip: input.req?.headers.get("x-forwarded-for") ?? null,
      userAgent: input.req?.headers.get("user-agent") ?? null
    }
  });
}
