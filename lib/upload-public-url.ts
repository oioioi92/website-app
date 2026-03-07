/**
 * 上传图片的公开访问根地址（仅服务端使用）。
 * 用于生成返回给前端的图片 URL，优先前台域名，不暴露后台。
 * 线上部署时务必在 .env 中配置其一，否则图片可能无法访问。
 */
export function getUploadPublicBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_UPLOAD_PUBLIC_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_FRONTEND_URL?.trim() ||
    "";
  return raw.replace(/\/$/, "");
}
