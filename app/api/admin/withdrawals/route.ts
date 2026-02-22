import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { parsePagination, parseSort } from "@/lib/backoffice/pagination";

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

  const where: NonNullable<Prisma.WithdrawalRequestFindManyArgs["where"]> = {};
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

  const [items, total] = await Promise.all([
    db.withdrawalRequest.findMany({
      where,
      include: { member: { select: { id: true, userRef: true, displayName: true } } },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: pageSize
    }),
    db.withdrawalRequest.count({ where })
  ]);

  return NextResponse.json({
    items: items.map((w) => ({
      id: w.id,
      wdId: w.wdId,
      userId: w.member.userRef,
      amount: Number(w.amount),
      bankName: w.bankName,
      bankAccount: w.bankAccount,
      status: w.status,
      rejectReason: w.rejectReason,
      burnReason: w.burnReason,
      paymentReferenceNo: w.paymentReferenceNo,
      createdAt: w.createdAt.toISOString(),
      completedAt: w.completedAt?.toISOString() ?? null,
      processingDurationSec: w.processingDurationSec,
      handlerId: w.handlerId
    })),
    total,
    page,
    pageSize
  });
}
