import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

export async function GET() {
  // Prefer reading the stamp file dropped into `public/` by the deploy script.
  // This avoids guessing about browser/WeChat/CDN caching.
  const stampPath = path.join(process.cwd(), "public", "__deploy_version.txt");
  try {
    const txt = await readFile(stampPath, "utf8");
    return new NextResponse(txt, {
      status: 200,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store"
      }
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "deploy version not found", path: stampPath },
      { status: 404, headers: { "cache-control": "no-store" } }
    );
  }
}

