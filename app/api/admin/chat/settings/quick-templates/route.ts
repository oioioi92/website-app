import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const KEY = "live_chat_quick_templates";

type QuickTemplatesPayload = {
  deposit?: string[];
  withdraw?: string[];
  walletProblem?: string[];
};

function normalize(arr: unknown): string[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((x) => typeof x === "string" && x.trim().length > 0)
    .map((x) => String(x).trim().slice(0, 500));
}

/** GET: 读取三类快捷句（Deposit / Withdraw / Wallet Problem） */
export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const row = await db.siteSetting.findUnique({ where: { key: KEY }, select: { valueJson: true } });
  const value = (row?.valueJson as QuickTemplatesPayload | null) ?? {};
  return NextResponse.json(
    {
      deposit: normalize(value.deposit),
      withdraw: normalize(value.withdraw),
      walletProblem: normalize(value.walletProblem)
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}

/** PUT: 保存三类快捷句 */
export async function PUT(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  let body: QuickTemplatesPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const valueJson = {
    deposit: normalize(body.deposit),
    withdraw: normalize(body.withdraw),
    walletProblem: normalize(body.walletProblem)
  };

  await db.siteSetting.upsert({
    where: { key: KEY },
    update: { valueJson },
    create: { key: KEY, valueJson }
  });

  return NextResponse.json(valueJson);
}
