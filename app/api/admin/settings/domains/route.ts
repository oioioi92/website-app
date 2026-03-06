import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const KEY = "settings_domains";

export type DomainRow = {
  id: string;
  domain: string;
  type: "PRIMARY" | "BACKUP";
  status: string;
  expiry: string;
  remark: string;
};

function toRows(value: unknown): DomainRow[] {
  if (!Array.isArray(value)) return [];
  return (value as DomainRow[]).filter((r) => r && typeof r.domain === "string");
}

export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const row = await db.siteSetting.findUnique({ where: { key: KEY }, select: { valueJson: true } });
  const raw = row?.valueJson as { rows?: unknown; dnsTarget?: string } | null;
  const rows = toRows(raw?.rows ?? raw ?? []);
  const dnsTarget = typeof raw?.dnsTarget === "string" ? raw.dnsTarget : "";
  return NextResponse.json({ rows, dnsTarget }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  let body: { rows?: DomainRow[]; dnsTarget?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }
  const rows = Array.isArray(body.rows) ? toRows(body.rows) : [];
  const dnsTarget = typeof body.dnsTarget === "string" ? body.dnsTarget : "";
  const valueJson = { rows, dnsTarget } as unknown as object;
  await db.siteSetting.upsert({
    where: { key: KEY },
    create: { key: KEY, valueJson },
    update: { valueJson },
  });
  return NextResponse.json({ ok: true, rows, dnsTarget });
}
