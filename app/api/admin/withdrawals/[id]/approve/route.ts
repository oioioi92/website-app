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

  const { id } = await params;
  const w = await db.withdrawalRequest.findUnique({ where: { id } });
  if (!w) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (w.status !== "PENDING" && w.status !== "PROCESSING") {
    return NextResponse.json({ error: "STATUS_NOT_PENDING" }, { status: 400 });
  }

  const now = new Date();
  const processingDurationSec = Math.floor((now.getTime() - w.createdAt.getTime()) / 1000);

  await db.withdrawalRequest.update({
    where: { id },
    data: {
      status: "APPROVED",
      firstActionAt: w.firstActionAt ?? now,
      completedAt: now,
      processingDurationSec,
      handlerId: user.id
    }
  });

  await writeAuditLog({
    actorId: user.id,
    action: "WITHDRAWAL_APPROVE",
    entityType: "WithdrawalRequest",
    entityId: id,
    diffJson: { wdId: w.wdId, amount: Number(w.amount) },
    req
  });

  return NextResponse.json({ ok: true });
}
