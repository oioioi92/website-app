import { notFound } from "next/navigation";
import { getAdminUserFromCookieStore } from "@/lib/auth";
import { canApproveWithdrawal } from "@/lib/rbac";
import { db } from "@/lib/db";
import { AdminWithdrawalDetailClient } from "@/components/admin/AdminWithdrawalDetailClient";

export const dynamic = "force-dynamic";

export default async function WithdrawalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminUserFromCookieStore();
  if (!user || !canApproveWithdrawal(user)) notFound();
  const { id } = await params;
  const w = await db.withdrawalRequest.findUnique({
    where: { id },
    include: { member: true }
  });
  if (!w) notFound();
  return <AdminWithdrawalDetailClient withdrawal={w} />;
}
