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
  const deposit = await db.depositRequest.findUnique({
    where: { id },
    include: { member: true }
  });
  if (!deposit) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  if (!deposit.firstViewedAt) {
    await db.depositRequest.update({
      where: { id },
      data: { firstViewedAt: new Date() }
    });
  }

  return NextResponse.json({
    id: deposit.id,
    txId: deposit.txId,
    userId: deposit.member.userRef,
    memberId: deposit.memberId,
    amount: Number(deposit.amount),
    channel: deposit.channel,
    referenceNo: deposit.referenceNo,
    status: deposit.status,
    rejectReason: deposit.rejectReason,
    burnReason: deposit.burnReason,
    remark: deposit.remark,
    createdAt: deposit.createdAt.toISOString(),
    firstViewedAt: deposit.firstViewedAt?.toISOString() ?? null,
    completedAt: deposit.completedAt?.toISOString() ?? null,
    processingDurationSec: deposit.processingDurationSec,
    handlerId: deposit.handlerId,
    member: {
      id: deposit.member.id,
      userRef: deposit.member.userRef,
      displayName: deposit.member.displayName
    }
  });
}
