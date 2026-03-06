import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const KEY = "site_allowed_domains";

/** GET: 读取允许的域名列表（可为空数组） */
export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const row = await db.siteSetting.findUnique({ where: { key: KEY }, select: { valueJson: true } });
  const value = row?.valueJson;
  const list = Array.isArray(value) ? (value as string[]).filter((d) => typeof d === "string" && d.trim() !== "") : [];
  return NextResponse.json({ domains: list }, { headers: { "Cache-Control": "no-store" } });
}

/** PUT: 保存允许的域名列表（允许空数组） */
export async function PUT(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  let body: { domains?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const raw = body.domains;
  const list = Array.isArray(raw)
    ? (raw as unknown[]).map((d) => (typeof d === "string" ? d.trim() : "")).filter((d) => d !== "")
    : [];

  await db.siteSetting.upsert({
    where: { key: KEY },
    create: { key: KEY, valueJson: list as unknown as object },
    update: { valueJson: list as unknown as object },
  });
  return NextResponse.json({ ok: true });
}
