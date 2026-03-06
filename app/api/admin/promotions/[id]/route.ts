import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getAdminUserFromRequest } from "@/lib/auth";
import { canEditContent } from "@/lib/rbac";
import { db } from "@/lib/db";
import { invalidateHomeCache } from "@/lib/public-home-cache";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** GET: 单条优惠（后台编辑用） */
export async function GET(req: NextRequest, { params }: Params) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!canEditContent(user)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const { id } = await params;
  const p = await db.promotion.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      subtitle: true,
      coverUrl: true,
      coverUrlMobilePromo: true,
      coverUrlDesktopHome: true,
      coverUrlMobileHome: true,
      detailJson: true,
      percent: true,
      startAt: true,
      endAt: true,
      isClaimable: true,
      ruleJson: true,
      ctaLabel: true,
      ctaUrl: true,
      isActive: true,
      sortOrder: true,
      createdAt: true,
      updatedAt: true
    }
  });
  if (!p) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  return NextResponse.json(
    {
      id: p.id,
      title: p.title,
      subtitle: p.subtitle ?? null,
      coverUrl: p.coverUrl ?? null,
      detailJson: p.detailJson,
      percent: p.percent != null ? Number(p.percent) : 0,
      startAt: p.startAt?.toISOString() ?? null,
      endAt: p.endAt?.toISOString() ?? null,
      isClaimable: p.isClaimable,
      ruleJson: p.ruleJson ?? null,
      ctaLabel: p.ctaLabel ?? null,
      ctaUrl: p.ctaUrl ?? null,
      isActive: p.isActive,
      sortOrder: p.sortOrder,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString()
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}

/** PUT: 更新优惠 */
export async function PUT(req: NextRequest, { params }: Params) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!canEditContent(user)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const { id } = await params;
  const existing = await db.promotion.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  let body: {
    title?: string;
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

  const detailJson = body.detailJson !== undefined ? (typeof body.detailJson === "string" ? (() => { try { return JSON.parse(body.detailJson as string); } catch { return {}; } })() : body.detailJson) : undefined;
  const ruleJson = body.ruleJson !== undefined ? (typeof body.ruleJson === "string" ? (() => { try { return JSON.parse(body.ruleJson as string); } catch { return null; } })() : body.ruleJson) : undefined;

  const startAt = body.startAt !== undefined && body.startAt != null && String(body.startAt).trim() !== "" ? new Date(body.startAt as string) : undefined;
  const endAt = body.endAt !== undefined && body.endAt != null && String(body.endAt).trim() !== "" ? new Date(body.endAt as string) : undefined;

  await db.promotion.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: String(body.title) }),
      ...(body.subtitle !== undefined && { subtitle: body.subtitle === null || body.subtitle === "" ? null : String(body.subtitle) }),
      ...(body.coverUrl !== undefined && { coverUrl: body.coverUrl === null || body.coverUrl === "" ? null : String(body.coverUrl) }),
      ...(detailJson !== undefined && { detailJson: (detailJson ?? {}) as object }),
      ...(body.percent !== undefined && { percent: Number(body.percent) || 0 }),
      ...(startAt !== undefined && { startAt }),
      ...(endAt !== undefined && { endAt }),
      ...(body.isClaimable !== undefined && { isClaimable: Boolean(body.isClaimable) }),
      ...(ruleJson !== undefined && { ruleJson: ruleJson === null ? Prisma.JsonNull : (ruleJson as object) }),
      ...(body.ctaLabel !== undefined && { ctaLabel: body.ctaLabel === null || body.ctaLabel === "" ? null : String(body.ctaLabel) }),
      ...(body.ctaUrl !== undefined && { ctaUrl: body.ctaUrl === null || body.ctaUrl === "" ? null : String(body.ctaUrl) }),
      ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
      ...(body.sortOrder !== undefined && { sortOrder: Number(body.sortOrder) || 0 })
    }
  });
  invalidateHomeCache();
  return NextResponse.json({ ok: true });
}
