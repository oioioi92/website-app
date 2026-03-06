import { redirect } from "next/navigation";
import { getAdminUserFromCookieStore } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminSecureLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminUserFromCookieStore();
  if (!user) {
    redirect("/admin/login?next=" + encodeURIComponent("/admin"));
  }

  return <AdminShell>{children}</AdminShell>;
}
