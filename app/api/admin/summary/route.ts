import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function parseDateRange(dateFrom?: string | null, dateTo?: string | null) {
  const from = dateFrom ? new Date(dateFrom) : null;
  let to: Date | null = dateTo ? new Date(dateTo) : null;
  if (to) to.setHours(23, 59, 59, 999);
  return { from, to };
}

export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const dateFrom = sp.get("dateFrom") ?? sp.get("date_from");
  const dateTo = sp.get("dateTo") ?? sp.get("date_to");
  const { from, to } = parseDateRange(dateFrom, dateTo);

  const baseDate = from && to ? { gte: from, lte: to } : undefined;

  const [newRegistration, depositAgg, withdrawAgg] = await Promise.all([
    baseDate
      ? db.member.count({ where: { createdAt: baseDate } })
      : Promise.resolve(0),
    baseDate
      ? db.depositRequest.aggregate({
          where: { status: "APPROVED", completedAt: baseDate },
          _sum: { amount: true }
        })
      : Promise.resolve({ _sum: { amount: null } }),
    baseDate
      ? db.withdrawalRequest.aggregate({
          where: {
            status: { in: ["APPROVED", "PAID"] },
            completedAt: baseDate
          },
          _sum: { amount: true }
        })
      : Promise.resolve({ _sum: { amount: null } })
  ]);

  const totalDeposit = Number(depositAgg._sum?.amount ?? 0);
  const totalWithdraw = Number(withdrawAgg._sum?.amount ?? 0);

  return NextResponse.json({
    newRegistration,
    totalDeposit,
    totalWithdraw,
    totalSales: 0,
    totalAngpao: 0,
    totalBonus: 0,
    rebates: 0,
    rescue: 0,
    gameSales: 0,
    vipLevel: 0,
    agentCommission: 0,
    manualAdd: 0,
    manualDeduct: 0
  });
}
