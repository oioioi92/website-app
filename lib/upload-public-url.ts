import type { NextRequest } from "next/server";

/**
 * 上传图片的公开访问根地址（仅服务端使用）。
 * 优先用当前请求的 host，确保返回的链接指向「存了文件的这台服务器」，避免 404。
 * 仅当无请求（如无 req）时才用 .env，便于后台/前台不同服务器时图片仍能打开。
 */
export function getUploadPublicBaseUrl(req?: NextRequest): string {
  if (req) {
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
    const proto = req.headers.get("x-forwarded-proto") || (req.url?.startsWith("https") ? "https" : "http");
    if (host) return `${proto === "https" ? "https" : "http"}://${host.split(",")[0].trim()}`;
  }
  const raw =
    process.env.NEXT_PUBLIC_UPLOAD_PUBLIC_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_FRONTEND_URL?.trim() ||
    "";
  return raw ? raw.replace(/\/$/, "") : "";
}
