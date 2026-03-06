import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { canManageAdmins } from "@/lib/rbac";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const KEY = "security_ip_whitelist";

export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!canManageAdmins(user)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const row = await db.siteSetting.findUnique({ where: { key: KEY }, select: { valueJson: true } });
  const v = row?.valueJson as { whitelist?: string } | null;
  const whitelist = typeof v?.whitelist === "string" ? v.whitelist : "";
  return NextResponse.json({ whitelist }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!canManageAdmins(user)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  let body: { whitelist?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }
  const whitelist = typeof body.whitelist === "string" ? body.whitelist : "";
  await db.siteSetting.upsert({
    where: { key: KEY },
    create: { key: KEY, valueJson: { whitelist } },
    update: { valueJson: { whitelist } },
  });
  return NextResponse.json({ ok: true });
}
