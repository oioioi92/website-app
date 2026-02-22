import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST: 内部接收游戏/支付供应商回调事件。
 * 具体实现可在此对接验签、入库、通知等逻辑。
 */
export async function POST(req: NextRequest) {
  try {
    await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }
  return NextResponse.json({ ok: false, error: "NOT_IMPLEMENTED" }, { status: 501 });
}
