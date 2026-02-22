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
  const w = await db.withdrawalRequest.findUnique({
    where: { id },
    include: { member: true }
  });
  if (!w) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  if (!w.firstViewedAt) {
    await db.withdrawalRequest.update({
      where: { id },
      data: { firstViewedAt: new Date() }
    });
  }

  return NextResponse.json({
    id: w.id,
    wdId: w.wdId,
    userId: w.member.userRef,
    memberId: w.memberId,
    amount: Number(w.amount),
    walletSnapshot: w.walletSnapshot != null ? Number(w.walletSnapshot) : null,
    bankName: w.bankName,
    bankAccount: w.bankAccount,
    status: w.status,
    rejectReason: w.rejectReason,
    burnReason: w.burnReason,
    paymentReferenceNo: w.paymentReferenceNo,
    assignedTo: w.assignedTo,
    assignedAt: w.assignedAt?.toISOString() ?? null,
    createdAt: w.createdAt.toISOString(),
    completedAt: w.completedAt?.toISOString() ?? null,
    processingDurationSec: w.processingDurationSec,
    handlerId: w.handlerId,
    member: { id: w.member.id, userRef: w.member.userRef, displayName: w.member.displayName }
  });
}
