import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { signChatAdminJwt } from "@/lib/chat-admin-jwt";

export const dynamic = "force-dynamic";

/** GET：返回用于连接 chat-server WebSocket 的短期 JWT，供后台 Live Chat 使用 */
export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  try {
    const token = signChatAdminJwt({ sub: user.id, role: user.role }, 900);
    return NextResponse.json({ token });
  } catch {
    return NextResponse.json({ error: "CHAT_ADMIN_JWT_SECRET not set" }, { status: 503 });
  }
}
