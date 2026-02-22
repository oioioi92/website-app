import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { canBurnTransaction } from "@/lib/rbac";
import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!canBurnTransaction(user)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const body = await req.json().catch(() => null) as { reason?: string } | null;
  const reason = typeof body?.reason === "string" ? body.reason.trim() : "";
  if (!reason) return NextResponse.json({ error: "reason is required" }, { status: 400 });

  const { id } = await params;
  const deposit = await db.depositRequest.findUnique({ where: { id } });
  if (!deposit) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (deposit.status !== "PENDING") {
    return NextResponse.json({ error: "STATUS_NOT_PENDING" }, { status: 400 });
  }

  const now = new Date();
  const processingDurationSec = Math.floor((now.getTime() - deposit.createdAt.getTime()) / 1000);

  await db.depositRequest.update({
    where: { id },
    data: {
      status: "BURNED",
      burnReason: reason,
      firstActionAt: deposit.firstActionAt ?? now,
      completedAt: now,
      processingDurationSec,
      handlerId: user.id
    }
  });

  await writeAuditLog({
    actorId: user.id,
    action: "DEPOSIT_BURN",
    entityType: "DepositRequest",
    entityId: id,
    diffJson: { txId: deposit.txId, reason },
    remark: reason,
    req
  });

  return NextResponse.json({ ok: true });
}
