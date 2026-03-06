import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const KEY_LIST = "settings_bank_list";
const KEY_LEGACY = "settings_bank";

export type PublicBankItem = {
  bankName: string;
  bankCode: string;
  accountName: string;
  accountNumber: string;
};

function toPublicItem(raw: Record<string, unknown>): PublicBankItem {
  return {
    bankName: String(raw.bankName ?? ""),
    bankCode: String(raw.bankCode ?? ""),
    accountName: String(raw.accountName ?? ""),
    accountNumber: String(raw.accountNumber ?? ""),
  };
}

/** GET: 前台充值页展示用银行列表（仅返回非维护中账户，只读无需鉴权） */
export async function GET() {
  const listRow = await db.siteSetting.findUnique({ where: { key: KEY_LIST }, select: { valueJson: true } });
  const rawList = listRow?.valueJson;
  if (Array.isArray(rawList) && rawList.length > 0) {
    const items = rawList
      .filter((r) => !Boolean((r as Record<string, unknown>).maintenanceMode))
      .map((r) => toPublicItem(r as Record<string, unknown>))
      .filter((it) => it.bankName || it.accountNumber || it.accountName);
    return NextResponse.json({ items }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } });
  }

  const legacyRow = await db.siteSetting.findUnique({ where: { key: KEY_LEGACY }, select: { valueJson: true } });
  const legacy = legacyRow?.valueJson as Record<string, unknown> | null;
  if (legacy && (legacy.bankName ?? legacy.accountNumber ?? legacy.accountName)) {
    const single = toPublicItem(legacy);
    return NextResponse.json({ items: [single] }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } });
  }

  return NextResponse.json({ items: [] }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } });
}
