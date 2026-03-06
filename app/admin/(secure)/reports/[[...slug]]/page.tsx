import { redirect } from "next/navigation";
import { AdminReportsSlugClient } from "./AdminReportsSlugClient";

export const dynamic = "force-dynamic";

/** 无 slug 时跳转到统一 Dashboard；有 slug 时保留原报表子页（兼容旧链接） */
export default async function AdminReportsPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const slugKey = Array.isArray(slug) ? slug[0] ?? "" : "";
  if (!slugKey) redirect("/admin/dashboard");
  return <AdminReportsSlugClient />;
}
