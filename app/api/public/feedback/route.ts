import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** POST: 提交用户反馈（前台或客服入口调用） */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null) as { message?: string; userRef?: string } | null;
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    if (!message) return NextResponse.json({ error: "MESSAGE_REQUIRED" }, { status: 400 });

    await db.feedback.create({
      data: {
        message,
        userRef: body?.userRef?.trim() || null,
        status: "PENDING",
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "CREATE_FAILED" }, { status: 500 });
  }
}
