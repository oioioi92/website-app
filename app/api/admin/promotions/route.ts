import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET: 优惠活动列表（后台管理用） */
export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10));
  const pageSize = Math.min(50, Math.max(10, parseInt(sp.get("pageSize") ?? "20", 10)));
  const activeOnly = sp.get("active") === "1";

  const where = activeOnly ? { isActive: true } : {};
  const [items, total] = await Promise.all([
    db.promotion.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        subtitle: true,
        coverUrl: true,
        ctaLabel: true,
        ctaUrl: true,
        isActive: true,
        sortOrder: true,
        createdAt: true
      }
    }),
    db.promotion.count({ where })
  ]);

  return NextResponse.json(
    {
      items: items.map((p) => ({
        id: p.id,
        title: p.title,
        subtitle: p.subtitle ?? null,
        coverUrl: p.coverUrl ?? null,
        ctaLabel: p.ctaLabel ?? null,
        ctaUrl: p.ctaUrl ?? null,
        isActive: p.isActive,
        sortOrder: p.sortOrder,
        createdAt: p.createdAt.toISOString()
      })),
      total,
      page,
      pageSize
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
