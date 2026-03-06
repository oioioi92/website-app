import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const KEY = "settings_ip_whitelist";

export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const row = await db.siteSetting.findUnique({ where: { key: KEY }, select: { valueJson: true } });
  const value = row?.valueJson;
  const text = typeof value === "string" ? value : Array.isArray(value) ? (value as string[]).join("\n") : "";
  return NextResponse.json({ whitelist: text }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  let body: { whitelist?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }
  const text = typeof body.whitelist === "string" ? body.whitelist : "";
  await db.siteSetting.upsert({
    where: { key: KEY },
    create: { key: KEY, valueJson: text as unknown as object },
    update: { valueJson: text as unknown as object },
  });
  return NextResponse.json({ ok: true });
}
