import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname)
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" }
    ]
  },
  async rewrites() {
    return [
      // 上传图片由应用直接提供，兼容旧链接 /uploads/... 与 /api/public/uploads/...
      { source: "/uploads/:path*", destination: "/api/public/uploads/:path*" },
    ];
  },
};

export default nextConfig;
