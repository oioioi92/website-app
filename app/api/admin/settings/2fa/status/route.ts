import type { NextRequest } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  return Response.json({ enabled: user.totpEnabled === true });
}
