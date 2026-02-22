import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DepositDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deposit = await db.depositRequest.findUnique({
    where: { id },
    include: { member: true }
  });
  if (!deposit) notFound();

  return (
    <div>
      <div className="mb-2">
        <Link href="/admin/deposits" className="font-medium text-sky-600 hover:underline">← 入款记录</Link>
        {deposit.status === "PENDING" && (
          <Link href="/admin/deposits/pending" className="ml-4 font-medium text-sky-600 hover:underline">待审核</Link>
        )}
      </div>
      <h1 className="text-xl font-semibold text-slate-800">入款详情</h1>
      <dl className="mt-4 grid gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2">
        <dt className="text-sm font-medium text-slate-500">Tx ID</dt>
        <dd className="font-mono font-medium text-slate-900">{deposit.txId}</dd>
        <dt className="text-sm font-medium text-slate-500">User ID</dt>
        <dd className="font-medium text-slate-900">{deposit.member.userRef}</dd>
        <dt className="text-sm font-medium text-slate-500">金额 (RM)</dt>
        <dd className="font-medium text-slate-900">{Number(deposit.amount).toFixed(2)}</dd>
        <dt className="text-sm font-medium text-slate-500">渠道</dt>
        <dd className="font-medium text-slate-900">{deposit.channel}</dd>
        <dt className="text-sm font-medium text-slate-500">凭证号</dt>
        <dd className="font-medium text-slate-900">{deposit.referenceNo ?? "—"}</dd>
        <dt className="text-sm font-medium text-slate-500">状态</dt>
        <dd className="font-medium text-slate-900">{deposit.status}</dd>
        <dt className="text-sm font-medium text-slate-500">创建时间</dt>
        <dd className="font-medium text-slate-900">{deposit.createdAt.toLocaleString()}</dd>
        <dt className="text-sm font-medium text-slate-500">完成时间</dt>
        <dd className="font-medium text-slate-900">{deposit.completedAt?.toLocaleString() ?? "—"}</dd>
        <dt className="text-sm font-medium text-slate-500">处理时长(秒)</dt>
        <dd className="font-medium text-slate-900">{deposit.processingDurationSec ?? "—"}</dd>
        {deposit.rejectReason && (
          <>
            <dt className="text-sm font-medium text-slate-500">拒绝原因</dt>
            <dd className="font-medium text-slate-900">{deposit.rejectReason}</dd>
          </>
        )}
        {deposit.burnReason && (
          <>
            <dt className="text-sm font-medium text-slate-500">Burn 原因</dt>
            <dd className="font-medium text-slate-900">{deposit.burnReason}</dd>
          </>
        )}
      </dl>
    </div>
  );
}
