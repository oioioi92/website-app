import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET: 某号码的消息历史；含顾客信息（member） */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { phone } = await params;
  const decoded = decodeURIComponent(phone);
  const list = await db.whatsAppMessage.findMany({
    where: { phone: decoded },
    orderBy: { createdAt: "asc" },
    select: { id: true, direction: true, content: true, createdAt: true, memberId: true }
  });

  const memberId = list.length > 0 ? list.find((m) => m.memberId)?.memberId : null;
  const member = memberId
    ? await db.member.findUnique({
        where: { id: memberId },
        select: { id: true, userRef: true, displayName: true }
      })
    : null;

  return NextResponse.json(
    { items: list, member },
    { headers: { "Cache-Control": "no-store" } }
  );
}
