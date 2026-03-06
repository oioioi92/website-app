import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const KEY = "settings_bank";
const KEY_LIST = "settings_bank_list";

export type BankItem = {
  id: string;
  bankName: string;
  bankCode: string;
  accountName: string;
  accountNumber: string;
  dailyLimit: string;
  singleLimit: string;
  maintenanceMode: boolean;
};

function normalizeItem(raw: Record<string, unknown>): BankItem {
  return {
    id: typeof raw.id === "string" ? raw.id : randomUUID(),
    bankName: String(raw.bankName ?? ""),
    bankCode: String(raw.bankCode ?? ""),
    accountName: String(raw.accountName ?? ""),
    accountNumber: String(raw.accountNumber ?? ""),
    dailyLimit: String(raw.dailyLimit ?? ""),
    singleLimit: String(raw.singleLimit ?? ""),
    maintenanceMode: Boolean(raw.maintenanceMode),
  };
}

/** GET: 读取出款银行列表（多条），兼容旧单条配置迁移 */
export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const listRow = await db.siteSetting.findUnique({ where: { key: KEY_LIST }, select: { valueJson: true } });
  const rawList = listRow?.valueJson;
  if (Array.isArray(rawList) && rawList.length > 0) {
    const items = rawList.map((r) => normalizeItem(r as Record<string, unknown>));
    return NextResponse.json({ items }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  }

  const legacyRow = await db.siteSetting.findUnique({ where: { key: KEY }, select: { valueJson: true } });
  const legacy = legacyRow?.valueJson as Record<string, unknown> | null;
  if (legacy && (legacy.bankName ?? legacy.accountNumber ?? legacy.accountName)) {
    const single = normalizeItem(legacy);
    return NextResponse.json({ items: [single] }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  }

  return NextResponse.json({ items: [] }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}

/** PUT: 保存出款银行列表（整表替换），前端传 items[] */
export async function PUT(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  let body: { items?: unknown[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const rawItems = Array.isArray(body.items) ? body.items : [];
  const items = rawItems.map((r) => normalizeItem(r as Record<string, unknown>));

  await db.siteSetting.upsert({
    where: { key: KEY_LIST },
    create: { key: KEY_LIST, valueJson: items as object },
    update: { valueJson: items as object },
  });
  return NextResponse.json({ ok: true });
}
