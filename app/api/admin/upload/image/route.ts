import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { isR2Configured } from "@/lib/r2";
import { buildUploadImageKey, uploadObjectToR2 } from "@/lib/r2";
import { getUploadPublicBaseUrl } from "@/lib/upload-public-url";

export const runtime = "nodejs";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_MB = 5;
const MAX_BYTES = MAX_MB * 1024 * 1024;

function getExt(mime: string): string {
  if (mime === "image/jpeg" || mime === "image/jpg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "webp";
}

/** POST: 管理员上传图片，返回可用的公开 URL（R2 或本地 public/uploads）。用于游戏 Logo、主题图、优惠图等。 */
export async function POST(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "FILE_REQUIRED" }, { status: 400 });
  if (!Number.isFinite(file.size) || file.size <= 0) return NextResponse.json({ error: "INVALID_SIZE" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 413 });
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "INVALID_TYPE" }, { status: 400 });

  const module = (form.get("module") as string)?.trim() || "admin";
  const ext = getExt(file.type);
  const objectKey = buildUploadImageKey(module, ext);
  const body = Buffer.from(await file.arrayBuffer());

  try {
    if (isR2Configured()) {
      const { publicUrl } = await uploadObjectToR2({
        objectKey,
        contentType: file.type,
        body,
      });
      const url = publicUrl.startsWith("http") ? publicUrl : `/${objectKey}`;
      return NextResponse.json({ ok: true, url, filename: file.name, size: file.size });
    }

    // 未配置 R2 时写入本地 public/uploads/<module>/，由 /api/public/uploads/ 提供访问
    const publicDir = path.join(process.cwd(), "public");
    const fullPath = path.join(publicDir, objectKey);
    mkdirSync(path.dirname(fullPath), { recursive: true });
    writeFileSync(fullPath, body);
    // 使用 API 路径，确保线上由本应用直接提供文件，不依赖 Nginx/静态目录
    const relativeKey = objectKey.replace(/^uploads\/?/, "").replace(/\\/g, "/");
    const apiPath = `/api/public/uploads/${relativeKey}`;
    const uploadBase = getUploadPublicBaseUrl();
    const url = uploadBase ? `${uploadBase}${apiPath}` : apiPath;
    return NextResponse.json({ ok: true, url, filename: file.name, size: file.size });
  } catch (e) {
    console.error("[admin/upload/image]", e);
    return NextResponse.json({ error: "UPLOAD_FAILED" }, { status: 500 });
  }
}
