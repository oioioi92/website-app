import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getAdminUserFromRequest } from "@/lib/auth";
import { canEditContent } from "@/lib/rbac";
import { db } from "@/lib/db";
import { invalidateHomeCache } from "@/lib/public-home-cache";

export const dynamic = "force-dynamic";

/** POST: 新建优惠 */
export async function POST(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!canEditContent(user)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  let body: {
    title: string;
    subtitle?: string | null;
    coverUrl?: string | null;
    detailJson?: unknown;
    percent?: number;
    startAt?: string | null;
    endAt?: string | null;
    isClaimable?: boolean;
    ruleJson?: unknown;
    ctaLabel?: string | null;
    ctaUrl?: string | null;
    isActive?: boolean;
    sortOrder?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return NextResponse.json({ error: "TITLE_REQUIRED" }, { status: 400 });

  const detailJson = body.detailJson !== undefined ? (typeof body.detailJson === "string" ? (() => { try { return JSON.parse(body.detailJson as string); } catch { return {}; } })() : body.detailJson) : {};
  const ruleJson = body.ruleJson !== undefined ? (typeof body.ruleJson === "string" ? (() => { try { return JSON.parse(body.ruleJson as string); } catch { return null; } })() : body.ruleJson) : null;
  const startAt = body.startAt != null && String(body.startAt).trim() !== "" ? new Date(body.startAt as string) : null;
  const endAt = body.endAt != null && String(body.endAt).trim() !== "" ? new Date(body.endAt as string) : null;

  const created = await db.promotion.create({
    data: {
      title,
      subtitle: body.subtitle ?? null,
      coverUrl: body.coverUrl ?? null,
      detailJson: (detailJson ?? {}) as object,
      percent: Number(body.percent) || 0,
      startAt,
      endAt,
      isClaimable: body.isClaimable !== false,
      ruleJson: ruleJson === null ? Prisma.JsonNull : (ruleJson as object),
      ctaLabel: body.ctaLabel ?? null,
      ctaUrl: body.ctaUrl ?? null,
      isActive: body.isActive !== false,
      sortOrder: Number(body.sortOrder) || 0
    },
    select: { id: true }
  });
  invalidateHomeCache();
  return NextResponse.json({ id: created.id });
}

/** GET: 优惠活动列表（后台管理用） */
export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!canEditContent(user)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

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
        percent: true,
        ctaLabel: true,
        ctaUrl: true,
        isActive: true,
        sortOrder: true,
        ruleJson: true,
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
        percent: p.percent != null ? Number(p.percent) : 0,
        ctaLabel: p.ctaLabel ?? null,
        ctaUrl: p.ctaUrl ?? null,
        isActive: p.isActive,
        sortOrder: p.sortOrder,
        ruleJson: p.ruleJson ?? null,
        createdAt: p.createdAt.toISOString()
      })),
      total,
      page,
      pageSize
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
