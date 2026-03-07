import type { NextRequest } from "next/server";

/**
 * 上传图片的公开访问根地址（仅服务端使用）。
 * 优先 .env 配置；未配置时用当前请求的 host（方便在真实网址测试时直接可用）。
 */
export function getUploadPublicBaseUrl(req?: NextRequest): string {
  const raw =
    process.env.NEXT_PUBLIC_UPLOAD_PUBLIC_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_FRONTEND_URL?.trim() ||
    "";
  if (raw) return raw.replace(/\/$/, "");

  // 真实网址测试：无 env 时用当前请求的 origin，确保返回的图片链接能打开
  if (req) {
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
    const proto = req.headers.get("x-forwarded-proto") || (req.url?.startsWith("https") ? "https" : "http");
    if (host) return `${proto === "https" ? "https" : "http"}://${host.split(",")[0].trim()}`;
  }
  return "";
}
