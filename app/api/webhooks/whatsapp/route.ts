import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";
import { normalizePhone } from "@/lib/phone";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN?.trim();
const APP_SECRET = process.env.WHATSAPP_APP_SECRET?.trim();

function verifyMetaSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!APP_SECRET || !signatureHeader || !signatureHeader.startsWith("sha256=")) return false;
  const sig = signatureHeader.slice(7);
  const expected = createHmac("sha256", APP_SECRET).update(rawBody, "utf8").digest("hex");
  try {
    return sig.length === expected.length && timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

/** GET: Meta 校验 Webhook，需返回 hub.challenge */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const mode = sp.get("hub.mode");
  const token = sp.get("hub.verify_token");
  const challenge = sp.get("hub.challenge");

  if (mode === "subscribe" && VERIFY_TOKEN && token === VERIFY_TOKEN && challenge) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" }
    });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

/** POST: 接收 Meta 推送的入站消息，解析后存库；关联会员（顾客信息）。需校验 X-Hub-Signature-256（配置 WHATSAPP_APP_SECRET） */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  if (APP_SECRET) {
    const sig = req.headers.get("x-hub-signature-256");
    if (!verifyMetaSignature(rawBody, sig)) {
      return new NextResponse("Bad Signature", { status: 401 });
    }
  }
  const body = (() => {
    try {
      return JSON.parse(rawBody) as unknown;
    } catch {
      return null;
    }
  })();
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: true });
  }

  const entry = (body as { entry?: unknown[] }).entry;
  if (!Array.isArray(entry)) {
    return NextResponse.json({ ok: true });
  }

  for (const item of entry) {
    const changes = (item as { changes?: unknown[] }).changes;
    if (!Array.isArray(changes)) continue;
    for (const change of changes) {
      const value = (change as { value?: Record<string, unknown> }).value;
      if (!value || typeof value !== "object") continue;
      const messages = value.messages as Array<{ from: string; id: string; timestamp: string; type: string; text?: { body: string } }> | undefined;
      if (!Array.isArray(messages)) continue;
      for (const msg of messages) {
        if (msg.type !== "text" || !msg.text?.body) continue;
        const phone = String(msg.from ?? "").trim();
        const metaId = String(msg.id ?? "").trim();
        const content = String(msg.text.body ?? "").trim();
        if (!phone || !metaId) continue;

        const digits = phone.replace(/\D/g, "");
        const phoneNorm = digits ? (normalizePhone("+" + digits) || "+" + digits) : phone;
        const member = await db.member.findFirst({
          where: {
            OR: [{ userRef: phone }, { userRef: phoneNorm }, { userRef: "+" + digits }]
          },
          select: { id: true }
        });

        await db.whatsAppMessage.upsert({
          where: { metaMessageId: metaId },
          create: {
            phone: phoneNorm,
            direction: "in",
            content: content.slice(0, 8000),
            metaMessageId: metaId,
            memberId: member?.id ?? null
          },
          update: {}
        }).catch(() => {});
      }
    }
  }

  return NextResponse.json({ ok: true });
}
