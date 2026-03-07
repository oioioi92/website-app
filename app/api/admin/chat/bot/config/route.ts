import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { signChatAdminJwt } from "@/lib/chat-admin-jwt";

export const dynamic = "force-dynamic";

const BASE = process.env["CHAT_SERVER_INTERNAL_URL"] ?? process.env["CHAT_SERVER_QUEUE_URL"] ?? "";

export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!BASE) return NextResponse.json({ error: "CHAT_SERVER not configured" }, { status: 503 });

  try {
    const token = signChatAdminJwt({ sub: user.id, role: user.role }, 60);
    const res = await fetch(`${BASE.replace(/\/$/, "")}/chat/api/admin/bot/config`, {
      headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` }
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; config?: unknown };
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!BASE) return NextResponse.json({ error: "CHAT_SERVER not configured" }, { status: 503 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  try {
    const token = signChatAdminJwt({ sub: user.id, role: user.role }, 60);
    const res = await fetch(`${BASE.replace(/\/$/, "")}/chat/api/admin/bot/config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(body)
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; config?: unknown };
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
