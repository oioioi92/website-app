import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  // Keep this endpoint lightweight and public:
  // - Used by deploy workflow health checks
  // - Must not leak secrets or internal details
  return NextResponse.json(
    {
      ok: true,
      service: "web",
      ts: new Date().toISOString()
    },
    { headers: { "cache-control": "no-store" } }
  );
}

