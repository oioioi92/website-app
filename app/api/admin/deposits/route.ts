import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getAdminUserFromRequest } from "@/lib/auth";
import { canManualCreateDeposit } from "@/lib/rbac";
import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { parsePagination, parseSort } from "@/lib/backoffice/pagination";
import { generateTxId } from "@/lib/backoffice/ids";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const { page, pageSize, skip } = parsePagination(sp);
  const { sortBy, sortOrder } = parseSort(sp, ["createdAt", "amount", "completedAt"], "createdAt", "desc");

  const status = sp.get("status") ?? "ALL";
  const dateFrom = sp.get("dateFrom");
  const dateTo = sp.get("dateTo");
  const userId = sp.get("userId")?.trim();
  const channel = sp.get("channel")?.trim();
  const amountMin = sp.get("amountMin");
  const amountMax = sp.get("amountMax");

  const where: NonNullable<Prisma.DepositRequestFindManyArgs["where"]> = {};

  if (status !== "ALL") where.status = status;
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) (where.createdAt as { gte?: Date }).gte = new Date(dateFrom);
    if (dateTo) {
      const d = new Date(dateTo);
      d.setHours(23, 59, 59, 999);
      (where.createdAt as { lte?: Date }).lte = d;
    }
  }
  if (userId) where.member = { userRef: userId };
  if (channel) where.channel = channel;
  const amountMinNum = amountMin != null && amountMin !== "" ? Number(amountMin) : NaN;
  const amountMaxNum = amountMax != null && amountMax !== "" ? Number(amountMax) : NaN;
  if (!Number.isNaN(amountMinNum) || !Number.isNaN(amountMaxNum)) {
    where.amount = {};
    if (!Number.isNaN(amountMinNum)) (where.amount as { gte?: number }).gte = amountMinNum;
    if (!Number.isNaN(amountMaxNum)) (where.amount as { lte?: number }).lte = amountMaxNum;
  }

  const [items, total] = await Promise.all([
    db.depositRequest.findMany({
      where,
      include: { member: { select: { id: true, userRef: true, displayName: true } } },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: pageSize
    }),
    db.depositRequest.count({ where })
  ]);

  return NextResponse.json({
    items: items.map((d) => ({
      id: d.id,
      txId: d.txId,
      userId: d.member.userRef,
      amount: Number(d.amount),
      channel: d.channel,
      referenceNo: d.referenceNo,
      status: d.status,
      rejectReason: d.rejectReason,
      burnReason: d.burnReason,
      remark: d.remark,
      createdAt: d.createdAt.toISOString(),
      completedAt: d.completedAt?.toISOString() ?? null,
      processingDurationSec: d.processingDurationSec,
      handlerId: d.handlerId
    })),
    total,
    page,
    pageSize
  });
}

export async function POST(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!canManualCreateDeposit(user)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const body = await req.json().catch(() => null) as { userId?: string; amount?: number; channel?: string; referenceNo?: string; createdAt?: string } | null;
  const userId = typeof body?.userId === "string" ? body.userId.trim() : "";
  const amount = typeof body?.amount === "number" ? body.amount : Number(body?.amount);
  const channel = typeof body?.channel === "string" ? body.channel.trim() : "";
  if (!userId || !Number.isFinite(amount) || amount <= 0 || !channel) {
    return NextResponse.json({ error: "user_id, amount (positive), and channel are required" }, { status: 400 });
  }

  const member = await db.member.findUnique({ where: { userRef: userId } });
  if (!member) return NextResponse.json({ error: "MEMBER_NOT_FOUND" }, { status: 404 });

  const referenceNo = typeof body?.referenceNo === "string" ? body.referenceNo.trim() || null : null;
  const createdAt = body?.createdAt ? new Date(body.createdAt) : new Date();
  const txId = generateTxId();

  const deposit = await db.depositRequest.create({
    data: {
      txId,
      memberId: member.id,
      amount,
      channel,
      referenceNo,
      status: "PENDING",
      createdAt
    },
    include: { member: { select: { userRef: true } } }
  });

  await writeAuditLog({
    actorId: user.id,
    action: "DEPOSIT_MANUAL_CREATE",
    entityType: "DepositRequest",
    entityId: deposit.id,
    diffJson: { txId, userId: member.userRef, amount, channel, referenceNo },
    req
  });

  return NextResponse.json({
    id: deposit.id,
    txId: deposit.txId,
    userId: deposit.member.userRef,
    amount: Number(deposit.amount),
    channel: deposit.channel,
    referenceNo: deposit.referenceNo,
    status: deposit.status,
    createdAt: deposit.createdAt.toISOString()
  });
}
