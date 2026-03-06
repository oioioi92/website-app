import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { isR2Configured } from "@/lib/r2";
import { buildUploadImageKey, uploadObjectToR2 } from "@/lib/r2";

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

/** POST: 管理员上传图片，返回可用的公开 URL（R2）。用于游戏 Logo、主题图、优惠图等。 */
export async function POST(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  if (!isR2Configured()) {
    return NextResponse.json({ error: "R2_NOT_CONFIGURED", message: "R2 storage not configured" }, { status: 503 });
  }

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
    const { publicUrl } = await uploadObjectToR2({
      objectKey,
      contentType: file.type,
      body,
    });
    // 返回相对路径，前端可自行拼 origin；部分调用方期望绝对 URL，这里返回 publicUrl（若 R2_PUBLIC_BASE_URL 为绝对地址则已是完整 URL）
    const url = publicUrl.startsWith("http") ? publicUrl : `/${objectKey}`;
    return NextResponse.json({
      ok: true,
      url,
      filename: file.name,
      size: file.size,
    });
  } catch (e) {
    console.error("[admin/upload/image]", e);
    return NextResponse.json({ error: "UPLOAD_FAILED" }, { status: 500 });
  }
}
