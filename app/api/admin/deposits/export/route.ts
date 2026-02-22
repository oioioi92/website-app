import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatInBackofficeTz } from "@/lib/backoffice/timezone";

export const dynamic = "force-dynamic";

function escapeCsv(s: string): string {
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const status = sp.get("status") ?? "ALL";
  const dateFrom = sp.get("dateFrom");
  const dateTo = sp.get("dateTo");

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

  const rows = await db.depositRequest.findMany({
    where,
    include: { member: { select: { userRef: true } } },
    orderBy: { createdAt: "desc" },
    take: 10000
  });

  const headers = ["Time (Asia/Kuching)", "Tx ID", "User ID", "Amount (RM)", "Channel", "Reference", "Status", "Processing (sec)", "Handler"];
  const lines = [headers.map(escapeCsv).join(",")];
  for (const r of rows) {
    lines.push(
      [
        formatInBackofficeTz(r.createdAt),
        r.txId,
        r.member.userRef,
        Number(r.amount).toFixed(2),
        r.channel,
        r.referenceNo ?? "",
        r.status,
        r.processingDurationSec ?? "",
        r.handlerId ?? ""
      ].map((v) => escapeCsv(String(v))).join(",")
    );
  }

  const csv = "\uFEFF" + lines.join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="deposits-${new Date().toISOString().slice(0, 10)}.csv"`
    }
  });
}
