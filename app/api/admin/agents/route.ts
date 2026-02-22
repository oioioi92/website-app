import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { parsePagination } from "@/lib/backoffice/pagination";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { page, pageSize, skip } = parsePagination(req.nextUrl.searchParams);

  const [agents, total] = await Promise.all([
    db.member.findMany({
      where: { referrals: { some: {} } },
      include: { _count: { select: { referrals: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize
    }),
    db.member.count({ where: { referrals: { some: {} } } })
  ]);

  return NextResponse.json({
    items: agents.map((a) => ({
      id: a.id,
      userRef: a.userRef,
      displayName: a.displayName,
      referralCode: a.referralCode,
      directCount: a._count.referrals,
      register_at: a.createdAt.toISOString()
    })),
    total,
    page,
    pageSize
  });
}
