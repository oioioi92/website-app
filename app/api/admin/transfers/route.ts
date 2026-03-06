import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { canApproveWithdrawal } from "@/lib/rbac";

export const dynamic = "force-dynamic";

/** Transfer queue list — placeholder; extend with real transfer API when ready */
export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!canApproveWithdrawal(user)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  return NextResponse.json({ items: [], total: 0 });
}
