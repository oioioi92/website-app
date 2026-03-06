import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { AdminWithdrawalDetailClient } from "@/components/admin/AdminWithdrawalDetailClient";

export const dynamic = "force-dynamic";

export default async function WithdrawalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const w = await db.withdrawalRequest.findUnique({
    where: { id },
    include: { member: true }
  });
  if (!w) notFound();
  return <AdminWithdrawalDetailClient withdrawal={w} />;
}
