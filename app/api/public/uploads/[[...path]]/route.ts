import { readFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

/** 公开提供上传的图片，不依赖 Nginx/静态目录，线上由应用直接提供。 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  const pathSegments = (await context.params).path;
  if (!pathSegments?.length) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  const safePath = pathSegments.join(path.sep).replace(/\.\./g, "");
  const publicDir = path.join(process.cwd(), "public");
  const fullPath = path.resolve(publicDir, "uploads", safePath);

  if (!fullPath.startsWith(path.resolve(publicDir, "uploads"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const buf = await readFile(fullPath);
    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME[ext] || "application/octet-stream";
    return new NextResponse(buf, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }
    throw e;
  }
}
