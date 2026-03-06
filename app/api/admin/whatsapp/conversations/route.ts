import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET: 会话列表（按手机号分组，取最后一条消息时间与预览）；含顾客信息（member） */
export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const raw = await db.whatsAppMessage.findMany({
    orderBy: { createdAt: "desc" },
    select: { phone: true, direction: true, content: true, createdAt: true, memberId: true }
  });

  const byPhone = new Map<
    string,
    { phone: string; lastAt: string; preview: string; memberId: string | null }
  >();
  for (const row of raw) {
    const phone = row.phone;
    if (byPhone.has(phone)) continue;
    byPhone.set(phone, {
      phone,
      lastAt: row.createdAt.toISOString(),
      preview: row.content.slice(0, 60) + (row.content.length > 60 ? "…" : ""),
      memberId: row.memberId
    });
  }

  const list = Array.from(byPhone.values()).sort(
    (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime()
  );

  const memberIds = [...new Set(list.map((c) => c.memberId).filter(Boolean))] as string[];
  const members =
    memberIds.length > 0
      ? await db.member.findMany({
          where: { id: { in: memberIds } },
          select: { id: true, userRef: true, displayName: true }
        })
      : [];
  const memberMap = new Map(members.map((m) => [m.id, m]));

  const items = list.map((c) => ({
    phone: c.phone,
    lastAt: c.lastAt,
    preview: c.preview,
    memberId: c.memberId,
    member: c.memberId ? memberMap.get(c.memberId) : null
  }));

  return NextResponse.json({ items }, { headers: { "Cache-Control": "no-store" } });
}
