import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { getClientIp } from "@/lib/net/clientIp";
import { normalizePhone, isE164 } from "@/lib/phone";
import { rateLimit } from "@/lib/rate-limit";
import { sendTextMessage } from "@/lib/whatsapp/send";

const WHATSAPP_SETTINGS_KEY = "settings_whatsapp";
const DEFAULT_TEMPLATE = "注册成功\nID: {{userRef}}\nP: {{tempPassword}}";

const registerSchema = z.object({
  phone: z.string().min(1).max(32),
  displayName: z.string().min(1).max(120),
  dateOfBirth: z.string().min(1).max(32).refine((s) => !Number.isNaN(new Date(s.trim()).getTime()), { message: "INVALID_DATE" }),
  bankName: z.string().min(1).max(120),
  bankAccount: z.string().min(1).max(80)
});

function randomTempPassword(): string {
  const n = Math.floor(Math.random() * 1_000_000);
  return String(n).padStart(6, "0");
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const bucket = rateLimit(`public-register:${ip}`, 10, 60 * 1000);
  if (!bucket.ok) {
    return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const msg = first.dateOfBirth ? "INVALID_DATE" : "INVALID_INPUT";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const rawPhone = parsed.data.phone.trim();
  const phone = normalizePhone(rawPhone);
  if (!phone || !isE164(phone)) {
    return NextResponse.json({ error: "INVALID_PHONE" }, { status: 400 });
  }

  const existing = await db.member.findUnique({
    where: { userRef: phone }
  });
  if (existing) {
    return NextResponse.json({ ok: false, alreadyRegistered: true }, { status: 200 });
  }

  const tempPassword = randomTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  const dateOfBirth = parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : null;

  const member = await db.member.create({
    data: {
      userRef: phone,
      displayName: parsed.data.displayName.trim() || null,
      dateOfBirth,
      mobile: phone,
      bankName: parsed.data.bankName?.trim() || null,
      bankAccount: parsed.data.bankAccount?.trim() || null,
      isActive: true,
      passwordHash,
      mustChangePassword: true
    }
  });

  const pendingSend = await db.registerPendingSend.create({
    data: {
      memberId: member.id,
      tempPasswordPlain: tempPassword
    }
  });

  const settingsRow = await db.siteSetting.findUnique({ where: { key: WHATSAPP_SETTINGS_KEY }, select: { valueJson: true } });
  const waSettings = (settingsRow?.valueJson as { enabled?: boolean; registerTemplate?: string } | null) ?? {};
  let autoSendOk = false;
  if (waSettings.enabled) {
    const template = waSettings.registerTemplate?.trim() || DEFAULT_TEMPLATE;
    const text = template
      .replace(/\{\{userRef\}\}/g, phone)
      .replace(/\{\{tempPassword\}\}/g, tempPassword);
    const sendResult = await sendTextMessage(phone, text);
    if (sendResult.ok) {
      autoSendOk = true;
      await db.registerPendingSend.update({
        where: { id: pendingSend.id },
        data: { sentAt: new Date() }
      });
    }
  }

  const hint = waSettings.enabled
    ? (autoSendOk ? "请查收 WhatsApp 获取登录 ID 与临时密码" : "注册成功。若未收到 WhatsApp，请稍后查收或联系客服（后台「待发送账号」可复制话术补发）。")
    : "注册成功。客服将通过 WhatsApp 发送登录信息，请稍后查收或联系客服。";

  return NextResponse.json({
    ok: true,
    message: "REGISTER_SUCCESS",
    hint,
    autoSendOk
  });
}
