import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { DEPOSIT_TOPUP_RULES_KEY, type DepositTopupRules } from "@/lib/deposit-topup-rules";

export const dynamic = "force-dynamic";

type Payload = { enabled?: boolean; maxBalanceForTopup?: number | null };

export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { getDepositTopupRules } = await import("@/lib/deposit-topup-rules");
  const rules = await getDepositTopupRules();
  return NextResponse.json(rules, { headers: { "Cache-Control": "no-store, max-age=0" } });
}

export async function PUT(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }
  const valueJson: DepositTopupRules = {
    enabled: Boolean(body.enabled),
    maxBalanceForTopup:
      typeof body.maxBalanceForTopup === "number" && body.maxBalanceForTopup >= 0
        ? body.maxBalanceForTopup
        : body.maxBalanceForTopup === null || body.maxBalanceForTopup === undefined
          ? null
          : null,
    includeGameBalance: false,
  };
  await db.siteSetting.upsert({
    where: { key: DEPOSIT_TOPUP_RULES_KEY },
    create: { key: DEPOSIT_TOPUP_RULES_KEY, valueJson: valueJson as object },
    update: { valueJson: valueJson as object },
  });
  return NextResponse.json({ ok: true });
}
