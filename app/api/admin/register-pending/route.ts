import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const WHATSAPP_SETTINGS_KEY = "settings_whatsapp";
const DEFAULT_TEMPLATE = "注册成功\nID: {{userRef}}\nP: {{tempPassword}}";

function renderTemplate(template: string, userRef: string, tempPassword: string): string {
  return template
    .replace(/\{\{userRef\}\}/g, userRef)
    .replace(/\{\{tempPassword\}\}/g, tempPassword);
}

export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const [list, settingsRow] = await Promise.all([
    db.registerPendingSend.findMany({
      orderBy: { createdAt: "desc" },
      include: { member: { select: { id: true, userRef: true, displayName: true } } }
    }),
    db.siteSetting.findUnique({ where: { key: WHATSAPP_SETTINGS_KEY }, select: { valueJson: true } })
  ]);

  const waSettings = (settingsRow?.valueJson as { registerTemplate?: string } | null) ?? {};
  const template = (waSettings.registerTemplate?.trim() || DEFAULT_TEMPLATE);

  return NextResponse.json({
    items: list.map((r) => {
      const userRef = r.member.userRef;
      const tempPassword = r.tempPasswordPlain;
      return {
        id: r.id,
        memberId: r.memberId,
        userRef,
        displayName: r.member.displayName,
        tempPasswordPlain: tempPassword,
        messageText: renderTemplate(template, userRef, tempPassword),
        createdAt: r.createdAt.toISOString(),
        sentAt: r.sentAt?.toISOString() ?? null
      };
    })
  });
}
