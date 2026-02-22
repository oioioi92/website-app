import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

type QueueItem = {
  id: string;
  visitorSessionId: string;
  status: string;
  assignedStaff: string | null;
  lastMessageTime: string | null;
  waitingSeconds: number;
  firstResponseTimeSec: number | null;
};

export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const baseUrl = process.env.CHAT_SERVER_INTERNAL_URL ?? process.env.CHAT_SERVER_QUEUE_URL ?? "";
  const secret = process.env.CHAT_INTERNAL_SECRET ?? "";

  if (!baseUrl) {
    return NextResponse.json({
      items: [],
      message: "CHAT_SERVER_INTERNAL_URL or CHAT_SERVER_QUEUE_URL not configured"
    });
  }

  try {
    const url = `${baseUrl.replace(/\/$/, "")}/chat/api/admin/queue`;
    const headers: Record<string, string> = { "Accept": "application/json" };
    if (secret) headers["X-Chat-Internal-Secret"] = secret;

    const res = await fetch(url, {
      headers,
      next: { revalidate: 0 }
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({
        items: [],
        error: `chat-server returned ${res.status}: ${text.slice(0, 200)}`
      });
    }

    const data = (await res.json()) as { items?: QueueItem[] };
    const items = Array.isArray(data.items) ? data.items : [];
    const sortOrder = req.nextUrl.searchParams.get("sort") !== "asc" ? "desc" : "asc";
    if (sortOrder === "desc") {
      items.sort((a, b) => (b.waitingSeconds ?? 0) - (a.waitingSeconds ?? 0));
    } else {
      items.sort((a, b) => (a.waitingSeconds ?? 0) - (b.waitingSeconds ?? 0));
    }

    return NextResponse.json({ items });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ items: [], error: msg });
  }
}
