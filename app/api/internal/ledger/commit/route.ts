import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST: 内部账本提交（供系统/服务调用）。
 * 具体实现可在此对接 LedgerTx 写入逻辑。
 */
export async function POST(req: NextRequest) {
  try {
    await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }
  return NextResponse.json({ ok: false, error: "NOT_IMPLEMENTED" }, { status: 501 });
}
