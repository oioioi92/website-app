import { NextResponse } from "next/server";

export function ensureInternalTestMode() {
  if ((process.env.INTERNAL_TEST_MODE ?? "0") !== "1") {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return null;
}
