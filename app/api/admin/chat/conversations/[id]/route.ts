import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { signChatAdminJwt } from "@/lib/chat-admin-jwt";

export const dynamic = "force-dynamic";

const BASE = process.env["CHAT_SERVER_INTERNAL_URL"] ?? process.env["CHAT_SERVER_QUEUE_URL"] ?? "";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAdminUserFromRequest(_req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!BASE) return NextResponse.json({ error: "CHAT_SERVER not configured" }, { status: 503 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "INVALID_ID" }, { status: 400 });

  try {
    const token = signChatAdminJwt({ sub: user.id, role: user.role }, 60);
    const res = await fetch(`${BASE.replace(/\/$/, "")}/chat/api/admin/conversations/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
