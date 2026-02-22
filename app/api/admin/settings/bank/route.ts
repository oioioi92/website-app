import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const KEY = "settings_bank";

type BankPayload = {
  bankName?: string;
  bankCode?: string;
  accountName?: string;
  accountNumber?: string;
  dailyLimit?: string;
  singleLimit?: string;
  maintenanceMode?: boolean;
};

/** GET: 读取出款银行配置 */
export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const row = await db.siteSetting.findUnique({ where: { key: KEY }, select: { valueJson: true } });
  const value = (row?.valueJson as BankPayload | null) ?? {};
  return NextResponse.json(
    {
    bankName: value.bankName ?? "",
    bankCode: value.bankCode ?? "",
    accountName: value.accountName ?? "",
    accountNumber: value.accountNumber ?? "",
    dailyLimit: value.dailyLimit ?? "",
    singleLimit: value.singleLimit ?? "",
    maintenanceMode: value.maintenanceMode ?? false
  },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}

/** PUT: 保存出款银行配置 */
export async function PUT(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  let body: BankPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const valueJson = {
    bankName: String(body.bankName ?? ""),
    bankCode: String(body.bankCode ?? ""),
    accountName: String(body.accountName ?? ""),
    accountNumber: String(body.accountNumber ?? ""),
    dailyLimit: String(body.dailyLimit ?? ""),
    singleLimit: String(body.singleLimit ?? ""),
    maintenanceMode: Boolean(body.maintenanceMode)
  };

  await db.siteSetting.upsert({
    where: { key: KEY },
    create: { key: KEY, valueJson: valueJson as object },
    update: { valueJson: valueJson as object }
  });
  return NextResponse.json({ ok: true });
}
