import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { getAdminUserFromRequest } from "@/lib/auth";
import { isR2Configured, buildUploadImageKey, uploadObjectToR2 } from "@/lib/r2";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

function sanitizeFilename(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9.\-_]/g, "-").replace(/-+/g, "-").slice(0, 80);
}

/** 获取当前请求的站点根 URL，用于生成图片绝对地址（不依赖是否在跑 dev） */
function getBaseUrl(req: NextRequest): string {
  const proto = req.headers.get("x-forwarded-proto") || req.nextUrl?.protocol?.replace(":", "") || "https";
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || req.nextUrl?.host || "";
  if (host) return `${proto}://${host}`.replace(/\/$/, "");
  const env = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || "";
  return env ? env.replace(/\/$/, "") : "";
}

export async function POST(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  let formData: FormData;
  try { formData = await req.formData(); }
  catch { return NextResponse.json({ error: "INVALID_FORM" }, { status: 400 }); }

  const file = formData.get("file");
  if (!file || typeof file === "string") return NextResponse.json({ error: "NO_FILE" }, { status: 400 });

  const f = file as File;
  if (!ALLOWED_TYPES.includes(f.type)) return NextResponse.json({ error: "INVALID_TYPE" }, { status: 400 });
  if (f.size > MAX_SIZE_BYTES) return NextResponse.json({ error: "FILE_TOO_LARGE", maxMB: 5 }, { status: 400 });

  const ext = f.type === "image/jpeg" ? "jpg" : f.type === "image/png" ? "png" : f.type === "image/webp" ? "webp" : "gif";
  const baseName = sanitizeFilename(f.name.replace(/\.[^.]+$/, ""));
  const filename = `${Date.now()}-${baseName}.${ext}`;
  const buffer = Buffer.from(await f.arrayBuffer());

  // 优先上传到 R2，返回公网绝对 URL，不依赖本机是否在跑 dev
  if (isR2Configured()) {
    try {
      const objectKey = buildUploadImageKey("promos", ext);
      const { publicUrl } = await uploadObjectToR2({
        objectKey,
        contentType: f.type,
        body: buffer,
      });
      return NextResponse.json({ ok: true, url: publicUrl, filename, size: f.size });
    } catch (e) {
      console.error("R2 upload failed, falling back to local:", e);
      // 失败时继续走本地存储
    }
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "promos");
  if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);

  const baseUrl = getBaseUrl(req);
  const url = baseUrl ? `${baseUrl}/uploads/promos/${filename}` : `/uploads/promos/${filename}`;
  return NextResponse.json({ ok: true, url, filename, size: f.size });
}
