import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { parsePagination, parseSort } from "@/lib/backoffice/pagination";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { page, pageSize, skip } = parsePagination(req.nextUrl.searchParams);
  const { sortBy, sortOrder } = parseSort(
    req.nextUrl.searchParams,
    ["createdAt", "amount"],
    "createdAt",
    "desc"
  );

  const [items, total] = await Promise.all([
    db.depositRequest.findMany({
      where: { status: "PENDING" },
      include: { member: { select: { id: true, userRef: true, displayName: true } } },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: pageSize
    }),
    db.depositRequest.count({ where: { status: "PENDING" } })
  ]);

  return NextResponse.json({
    items: items.map((d) => ({
      id: d.id,
      txId: d.txId,
      userId: d.member.userRef,
      memberId: d.memberId,
      amount: Number(d.amount),
      channel: d.channel,
      referenceNo: d.referenceNo,
      status: d.status,
      createdAt: d.createdAt.toISOString(),
      elapsedSec: Math.floor((Date.now() - d.createdAt.getTime()) / 1000)
    })),
    total,
    page,
    pageSize
  });
}
