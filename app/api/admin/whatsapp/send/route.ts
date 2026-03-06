import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendTextMessage } from "@/lib/whatsapp/send";
import { normalizePhone } from "@/lib/phone";

export const dynamic = "force-dynamic";

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

/** POST: 后台发回复。body: { phone, text }。24h 外仅可发模板（本接口仍尝试发自由文本，Meta 会拒则返回错误） */
export async function POST(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  let payload: { phone?: string; text?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }
  const phoneRaw = payload.phone?.trim();
  const text = payload.text?.trim();
  if (!phoneRaw || !text) {
    return NextResponse.json({ error: "MISSING_PHONE_OR_TEXT" }, { status: 400 });
  }

  const digits = phoneRaw.replace(/\D/g, "");
  const phone = digits ? (normalizePhone(phoneRaw.startsWith("+") ? phoneRaw : "+" + digits) || "+" + digits) : phoneRaw;

  const lastIn = await db.whatsAppMessage.findFirst({
    where: { phone, direction: "in" },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true }
  });
  const within24h = lastIn ? Date.now() - lastIn.createdAt.getTime() < TWENTY_FOUR_HOURS_MS : false;

  if (!within24h) {
    return NextResponse.json(
      { ok: false, error: "OUTSIDE_24H", outside24h: true },
      { status: 200 }
    );
  }

  const result = await sendTextMessage(phone, text);
  if (!result.ok) {
    const is24h = result.error?.toLowerCase().includes("24") || result.error?.toLowerCase().includes("template");
    return NextResponse.json(
      { ok: false, error: result.error, outside24h: is24h },
      { status: 200 }
    );
  }

  await db.whatsAppMessage.create({
    data: {
      phone,
      direction: "out",
      content: text.slice(0, 8000)
    }
  });

  return NextResponse.json({ ok: true, outside24h: !within24h });
}
