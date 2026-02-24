import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { signChatAdminJwt } from "@/lib/chat-admin-jwt";

export const dynamic = "force-dynamic";

function getChatServerBase(): string {
  return (
    process.env["CHAT_SERVER_INTERNAL_URL"]?.replace(/\/$/, "") ??
    process.env["NEXT_PUBLIC_CHAT_SERVER_URL"]?.replace(/\/$/, "") ??
    ""
  );
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const base = getChatServerBase();
  if (!base) return NextResponse.json({ error: "CHAT_SERVER not configured" }, { status: 503 });

  try {
    const body = await req.json();
    const token = signChatAdminJwt({ sub: user.id, role: user.role });
    const res = await fetch(`${base}/chat/api/admin/canned-replies/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
      next: { revalidate: 0 }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAdminUserFromRequest(_req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const base = getChatServerBase();
  if (!base) return NextResponse.json({ error: "CHAT_SERVER not configured" }, { status: 503 });

  try {
    const token = signChatAdminJwt({ sub: user.id, role: user.role });
    const res = await fetch(`${base}/chat/api/admin/canned-replies/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      next: { revalidate: 0 }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
