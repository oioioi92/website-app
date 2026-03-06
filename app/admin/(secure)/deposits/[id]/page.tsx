import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { AdminDepositDetailClient } from "@/components/admin/AdminDepositDetailClient";

export const dynamic = "force-dynamic";

export default async function DepositDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deposit = await db.depositRequest.findUnique({
    where: { id },
    include: { member: true }
  });
  if (!deposit) notFound();
  return <AdminDepositDetailClient deposit={deposit} />;
}
