import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Phase2 CMS",
  description: "可扩展 CMS，支持 RBAC、审计与 R2 上传"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="w-full">
      <body className="w-full min-w-0 overflow-x-hidden">{children}</body>
    </html>
  );
}
