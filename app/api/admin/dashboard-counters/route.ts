import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const pendingTx = await db.depositRequest.count({ where: { status: "PENDING" } });
  return NextResponse.json(
    { chatUnread: 0, pendingTx },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
