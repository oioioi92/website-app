import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getClientIp } from "@/lib/net/clientIp";

export const dynamic = "force-dynamic";

/** POST: 记录推荐链接点击（前台带 ref 的落地页或链接调用） */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null) as { referrerId?: string; source?: string } | null;
    const referrerId = typeof body?.referrerId === "string" ? body.referrerId.trim() : null;
    const source = typeof body?.source === "string" ? body.source.trim() : null;
    const ip = getClientIp(req.headers);
    const userAgent = req.headers.get("user-agent") ?? null;

    await db.referrerClick.create({
      data: { referrerId, source, ip, userAgent },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "LOG_FAILED" }, { status: 500 });
  }
}
