import { NextResponse } from "next/server";
import { ensureInternalTestMode } from "@/lib/internal-test";

const SESSION_COOKIE = "member_ref";

export async function POST() {
  const gate = ensureInternalTestMode();
  if (gate) return gate;

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0)
  });
  return res;
}
