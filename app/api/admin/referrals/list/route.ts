import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export type ReferralListRow = {
  id: string;
  userRef: string;
  displayName: string | null;
  referralCode: string | null;
  depositCount: number;
  withdrawCount: number;
  referralCount: number;
};

export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(sp.get("pageSize") ?? String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE));
  const search = sp.get("search")?.trim() || null;
  const sortBy = sp.get("sortBy")?.trim() || "referralCount";
  const order = sp.get("order")?.toLowerCase() === "asc" ? "asc" : "desc";

  const where = {
    referrals: { some: {} } as const,
    ...(search
      ? {
          OR: [
            { userRef: { contains: search } },
            { displayName: { contains: search } },
            { referralCode: { contains: search } },
          ],
        }
      : {}),
  };

  type OrderKey = "referralCount" | "userRef" | "depositCount" | "withdrawCount";
  const orderKey = ["referralCount", "userRef", "depositCount", "withdrawCount"].includes(sortBy) ? (sortBy as OrderKey) : "referralCount";
  const orderBy: Prisma.MemberOrderByWithRelationInput =
    orderKey === "referralCount"
      ? { referrals: { _count: order } }
      : orderKey === "userRef"
        ? { userRef: order }
        : orderKey === "depositCount"
          ? { depositCount: order }
          : { withdrawCount: order };

  const [items, total] = await Promise.all([
    db.member.findMany({
      where,
      select: {
        id: true,
        userRef: true,
        displayName: true,
        referralCode: true,
        depositCount: true,
        withdrawCount: true,
        _count: { select: { referrals: true } },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.member.count({ where }),
  ]);

  const rows: ReferralListRow[] = items.map((m) => ({
    id: m.id,
    userRef: m.userRef,
    displayName: m.displayName,
    referralCode: m.referralCode,
    depositCount: m.depositCount,
    withdrawCount: m.withdrawCount,
    referralCount: m._count.referrals,
  }));

  return NextResponse.json({ items: rows, total, page, pageSize });
}
