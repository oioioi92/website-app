import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { canApproveWithdrawal } from "@/lib/rbac";
import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!canApproveWithdrawal(user)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const body = await req.json().catch(() => null) as { paymentReferenceNo?: string } | null;
  const paymentReferenceNo = typeof body?.paymentReferenceNo === "string" ? body.paymentReferenceNo.trim() || null : null;

  const { id } = await params;
  const w = await db.withdrawalRequest.findUnique({ where: { id }, include: { member: true } });
  if (!w) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (w.status !== "PENDING" && w.status !== "PROCESSING" && w.status !== "APPROVED") {
    return NextResponse.json({ error: "STATUS_NOT_APPROVED" }, { status: 400 });
  }

  const now = new Date();
  const processingDurationSec = Math.floor((now.getTime() - w.createdAt.getTime()) / 1000);
  const amountNeg = -Number(w.amount);

  await db.$transaction(async (tx) => {
    await tx.walletTransaction.create({
      data: {
        memberId: w.memberId,
        type: "withdraw",
        amountSigned: amountNeg,
        currency: "MYR",
        status: "COMPLETED",
        refNo: paymentReferenceNo ?? w.wdId,
        note: paymentReferenceNo ? `Ref: ${paymentReferenceNo}` : null,
        happenedAt: now,
        createdByAdminId: user.id
      }
    });
    await tx.withdrawalRequest.update({
      where: { id },
      data: {
        status: "PAID",
        paymentReferenceNo,
        completedAt: now,
        processingDurationSec,
        handlerId: user.id
      }
    });
  });

  await writeAuditLog({
    actorId: user.id,
    action: "WITHDRAWAL_MARK_PAID",
    entityType: "WithdrawalRequest",
    entityId: id,
    diffJson: { wdId: w.wdId, amount: Number(w.amount), paymentReferenceNo },
    req
  });

  return NextResponse.json({ ok: true });
}
