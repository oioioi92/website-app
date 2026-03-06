import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET: WhatsApp 发信是否在线（供 header / dashboard 状态轮询）；Baileys 时可选检测是否被 block */
export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const useBaileys = process.env.WHATSAPP_USE_BAILEYS === "true" || process.env.WHATSAPP_USE_BAILEYS === "1";
  const baileysUrl = process.env.WHATSAPP_BAILEYS_URL?.trim();
  const hasOfficial = !!(process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() && process.env.WHATSAPP_ACCESS_TOKEN?.trim());

  let ok = false;
  let mode: string | null = null;
  let blocked: string[] | null = null;

  if (useBaileys && baileysUrl) {
    try {
      const base = baileysUrl.replace(/\/$/, "");
      const res = await fetch(`${base}/status`, {
        method: "GET",
        signal: AbortSignal.timeout(5000)
      });
      const text = await res.text();
      ok = res.ok && (text.includes("已连接") || text.includes("Connected") || text.includes("ok"));
      mode = "baileys";
      try {
        const blockedRes = await fetch(`${base}/blocked`, { method: "GET", signal: AbortSignal.timeout(3000) });
        if (blockedRes.ok) {
          const data = await blockedRes.json().catch(() => ({}));
          blocked = Array.isArray((data as { blocked?: string[] }).blocked)
            ? (data as { blocked: string[] }).blocked
            : null;
        }
      } catch {
        // ignore blocked check failure
      }
    } catch {
      ok = false;
      mode = "baileys";
    }
  } else if (hasOfficial) {
    ok = true;
    mode = "official";
  }

  return NextResponse.json(
    { ok, mode, blocked },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
