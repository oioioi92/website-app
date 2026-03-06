import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { canAccessSettings } from "@/lib/rbac";
import { writeAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { WITHDRAW_RULES_KEY, getWithdrawRules, type WithdrawRules } from "@/lib/withdraw-rules";

export const dynamic = "force-dynamic";

type Payload = {
  enabled?: boolean;
  minAmount?: number | null;
  maxAmount?: number | null;
  dailyLimitCount?: number | null;
};

function toNum(x: unknown): number | null {
  if (x === null || x === undefined) return null;
  const n = Number(x);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!canAccessSettings(user)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const rules = await getWithdrawRules();
  return NextResponse.json(rules, { headers: { "Cache-Control": "no-store, max-age=0" } });
}

export async function PUT(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!canAccessSettings(user)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }
  const valueJson: WithdrawRules = {
    enabled: Boolean(body.enabled),
    minAmount: toNum(body.minAmount),
    maxAmount: toNum(body.maxAmount),
    dailyLimitCount: toNum(body.dailyLimitCount),
  };
  await db.siteSetting.upsert({
    where: { key: WITHDRAW_RULES_KEY },
    create: { key: WITHDRAW_RULES_KEY, valueJson: valueJson as object },
    update: { valueJson: valueJson as object },
  });
  await writeAuditLog({
    actorId: user.id,
    action: "SETTINGS_WITHDRAW_RULES_SAVE",
    entityType: "SiteSetting",
    entityId: WITHDRAW_RULES_KEY,
    diffJson: { enabled: valueJson.enabled },
    req,
  });
  return NextResponse.json({ ok: true });
}
