import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { canAccessSettings } from "@/lib/rbac";
import { writeAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const KEY = "settings_whatsapp";

const DEFAULT_TEMPLATE = "注册成功\nID: {{userRef}}\nP: {{tempPassword}}";

type WhatsappPayload = {
  enabled?: boolean;
  registerTemplate?: string;
};

/** GET: 读取 WhatsApp 发信配置 */
export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!canAccessSettings(user)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const row = await db.siteSetting.findUnique({ where: { key: KEY }, select: { valueJson: true } });
  const value = (row?.valueJson as WhatsappPayload | null) ?? {};
  const hasOfficialEnv = !!(process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN);
  const useBaileys = process.env.WHATSAPP_USE_BAILEYS === "true" || process.env.WHATSAPP_USE_BAILEYS === "1";
  const hasBaileysUrl = !!process.env.WHATSAPP_BAILEYS_URL?.trim();
  const hasBaileys = useBaileys && hasBaileysUrl;
  const hasEnv = hasOfficialEnv || hasBaileys;

  return NextResponse.json(
    {
      enabled: value.enabled ?? false,
      registerTemplate: value.registerTemplate ?? DEFAULT_TEMPLATE,
      hasEnv,
      hasBaileys
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}

/** PUT: 保存 WhatsApp 发信配置 */
export async function PUT(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!canAccessSettings(user)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  let body: WhatsappPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const valueJson = {
    enabled: Boolean(body.enabled),
    registerTemplate: typeof body.registerTemplate === "string" ? body.registerTemplate : DEFAULT_TEMPLATE
  };

  await db.siteSetting.upsert({
    where: { key: KEY },
    create: { key: KEY, valueJson: valueJson as object },
    update: { valueJson: valueJson as object }
  });
  await writeAuditLog({
    actorId: user.id,
    action: "SETTINGS_WHATSAPP_SAVE",
    entityType: "SiteSetting",
    entityId: KEY,
    diffJson: { enabled: valueJson.enabled },
    req,
  });
  return NextResponse.json({ ok: true });
}
