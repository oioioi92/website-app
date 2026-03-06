/**
 * 发送文本到指定号码。支持两种模式：
 * 1) 官方 Meta Cloud API：配 WHATSAPP_PHONE_NUMBER_ID、WHATSAPP_ACCESS_TOKEN
 * 2) 个人号（Baileys）：配 WHATSAPP_USE_BAILEYS=true、WHATSAPP_BAILEYS_URL（发信服务地址）
 * 不抛异常，失败只返回 { ok: false, error } 并打日志
 */

const BASE_URL = "https://graph.facebook.com/v18.0";

export type SendResult = { ok: true } | { ok: false; error: string };

/** 发送文本到指定号码。to 为 E.164 格式（可含 +），会去掉 + 后发送 */
export async function sendTextMessage(to: string, text: string): Promise<SendResult> {
  const toClean = to.replace(/\D/g, "");
  if (!toClean) {
    return { ok: false, error: "INVALID_TO" };
  }

  const useBaileys = process.env.WHATSAPP_USE_BAILEYS === "true" || process.env.WHATSAPP_USE_BAILEYS === "1";
  const baileysUrl = process.env.WHATSAPP_BAILEYS_URL?.trim();

  if (useBaileys && baileysUrl) {
    try {
      const base = baileysUrl.replace(/\/$/, "");
      const res = await fetch(`${base}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: toClean, text })
      });
      const data = await res.json().catch(() => ({}));
      const ok = res.ok && (data as { ok?: boolean }).ok === true;
      if (!ok) {
        const errMsg = (data as { error?: string })?.error ?? res.statusText;
        if (process.env.NODE_ENV !== "production") {
          console.warn("[WhatsApp send Baileys]", res.status, errMsg);
        }
        return { ok: false, error: errMsg };
      }
      return { ok: true };
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      if (process.env.NODE_ENV !== "production") {
        console.warn("[WhatsApp send Baileys] fetch error", err);
      }
      return { ok: false, error: err };
    }
  }

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  if (!phoneNumberId || !accessToken) {
    return { ok: false, error: "NOT_CONFIGURED" };
  }

  const url = `${BASE_URL}/${phoneNumberId}/messages`;
  const body = {
    messaging_product: "whatsapp",
    to: toClean,
    type: "text",
    text: { body: text }
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errMsg = (data as { error?: { message?: string } })?.error?.message ?? res.statusText;
      if (process.env.NODE_ENV !== "production") {
        console.warn("[WhatsApp send]", res.status, errMsg, data);
      }
      return { ok: false, error: errMsg };
    }
    return { ok: true };
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    if (process.env.NODE_ENV !== "production") {
      console.warn("[WhatsApp send] fetch error", err);
    }
    return { ok: false, error: err };
  }
}
