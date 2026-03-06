import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { canApproveWithdrawal } from "@/lib/rbac";
import { db } from "@/lib/db";
import { parsePagination, parseSort } from "@/lib/backoffice/pagination";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!canApproveWithdrawal(user)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const sp = req.nextUrl.searchParams;
  const statusFilter = sp.get("status") ?? "PENDING";
  const where = statusFilter === "ALL" ? {} : { status: statusFilter === "PROCESSING" ? "PROCESSING" : "PENDING" };

  const { page, pageSize, skip } = parsePagination(sp);
  const { sortBy, sortOrder } = parseSort(sp, ["createdAt", "amount"], "createdAt", "desc");

  const [items, total] = await Promise.all([
    db.withdrawalRequest.findMany({
      where,
      include: { member: { select: { id: true, userRef: true, displayName: true, mobile: true } } },
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
      memberId: w.memberId,
      amount: Number(w.amount),
      walletSnapshot: w.walletSnapshot != null ? Number(w.walletSnapshot) : null,
      bankName: w.bankName,
      bankAccount: w.bankAccount,
      status: w.status,
      createdAt: w.createdAt.toISOString(),
      elapsedSec: Math.floor((Date.now() - w.createdAt.getTime()) / 1000),
      assignedTo: w.assignedTo
    })),
    total,
    page,
    pageSize
  });
}
