import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { canApproveDeposit } from "@/lib/rbac";
import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!canApproveDeposit(user)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const { id } = await params;
  const deposit = await db.depositRequest.findUnique({
    where: { id },
    include: { member: true }
  });
  if (!deposit) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (deposit.status !== "PENDING") {
    return NextResponse.json({ error: "STATUS_NOT_PENDING" }, { status: 400 });
  }

  const now = new Date();
  const processingDurationSec = Math.floor((now.getTime() - deposit.createdAt.getTime()) / 1000);

  await db.$transaction(async (tx) => {
    await tx.walletTransaction.create({
      data: {
        memberId: deposit.memberId,
        type: "deposit",
        amountSigned: deposit.amount,
        currency: "MYR",
        channel: deposit.channel,
        status: "COMPLETED",
        refNo: deposit.referenceNo ?? deposit.txId,
        happenedAt: now,
        createdByAdminId: user.id
      }
    });
    await tx.depositRequest.update({
      where: { id },
      data: {
        status: "APPROVED",
        firstActionAt: deposit.firstActionAt ?? now,
        completedAt: now,
        processingDurationSec,
        handlerId: user.id
      }
    });
  });

  await writeAuditLog({
    actorId: user.id,
    action: "DEPOSIT_APPROVE",
    entityType: "DepositRequest",
    entityId: id,
    diffJson: { txId: deposit.txId, amount: Number(deposit.amount), memberId: deposit.memberId },
    req
  });

  return NextResponse.json({ ok: true });
}
