import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { parsePagination, parseSort } from "@/lib/backoffice/pagination";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const { page, pageSize, skip } = parsePagination(sp);
  const { sortBy, sortOrder } = parseSort(
    sp,
    ["register_at", "userRef", "lastDepositAt", "lastLoginAt"],
    "register_at",
    "desc"
  );
  const sortField = sortBy === "register_at" ? "createdAt" : sortBy === "userRef" ? "userRef" : sortBy;

  const search = sp.get("search")?.trim();
  const where = search
    ? {
        OR: [
          { userRef: { contains: search } },
          { displayName: { contains: search } },
          { mobile: { contains: search } }
        ]
      }
    : {};

  const [items, total] = await Promise.all([
    db.member.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
      skip,
      take: pageSize,
      include: {
        _count: {
          select: { depositRequests: true, withdrawalRequests: true }
        }
      }
    }),
    db.member.count({ where })
  ]);

  const memberIds = items.map((m) => m.id);
  const balances = await db.walletTransaction
    .groupBy({
      by: ["memberId"],
      _sum: { amountSigned: true },
      where: { memberId: { in: memberIds } }
    })
    .then((rows) => new Map(rows.map((r) => [r.memberId, Number(r._sum.amountSigned ?? 0)])));

  return NextResponse.json({
    items: items.map((m) => ({
      id: m.id,
      userRef: m.userRef,
      displayName: m.displayName,
      mobile: m.mobile,
      bankName: m.bankName,
      bankAccount: m.bankAccount,
      referralCode: m.referralCode,
      referrerId: m.referrerId,
      register_at: m.createdAt.toISOString(),
      main_wallet_balance: balances.get(m.id) ?? 0,
      deposit_count: m.depositCount,
      withdraw_count: m.withdrawCount,
      last_deposit_at: m.lastDepositAt?.toISOString() ?? null,
      last_login_at: m.lastLoginAt?.toISOString() ?? null,
      last_login_ip: m.lastLoginIp
    })),
    total,
    page,
    pageSize
  });
}
