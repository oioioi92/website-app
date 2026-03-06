import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** POST: 检查 WhatsApp 环境是否已配置（不发起真实外呼） */
export async function POST(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const hasOfficial = !!(
    process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() &&
    process.env.WHATSAPP_ACCESS_TOKEN?.trim()
  );
  const useBaileys = process.env.WHATSAPP_USE_BAILEYS === "true" || process.env.WHATSAPP_USE_BAILEYS === "1";
  const hasBaileysUrl = !!process.env.WHATSAPP_BAILEYS_URL?.trim();
  const hasBaileys = useBaileys && hasBaileysUrl;
  const hasEnv = hasOfficial || hasBaileys;

  if (hasEnv) {
    return NextResponse.json({
      ok: true,
      message: hasOfficial
        ? "WhatsApp Cloud API env configured; send a test from Register Pending to verify."
        : "Baileys URL configured; send a test from Register Pending to verify.",
    });
  }
  return NextResponse.json({ ok: false, message: "WhatsApp env not configured" });
}
