import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { canApproveDeposit } from "@/lib/rbac";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** 顶栏 badge：待处理入款数；chatUnread 可后续接真实未读。 */
export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!canApproveDeposit(user)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const pendingTx = await db.depositRequest.count({ where: { status: "PENDING" } });

  return NextResponse.json(
    { chatUnread: 0, pendingTx },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
