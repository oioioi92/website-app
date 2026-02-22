import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function WithdrawalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const w = await db.withdrawalRequest.findUnique({
    where: { id },
    include: { member: true }
  });
  if (!w) notFound();

  return (
    <div>
      <div className="mb-2">
        <Link href="/admin/withdrawals" className="font-medium text-sky-600 hover:underline">← 提款记录</Link>
        {(w.status === "PENDING" || w.status === "PROCESSING") && (
          <Link href="/admin/withdrawals/pending" className="ml-4 font-medium text-sky-600 hover:underline">待处理</Link>
        )}
      </div>
      <h1 className="text-xl font-semibold text-slate-800">提款详情</h1>
      <dl className="mt-4 grid gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2">
        <dt className="text-sm font-medium text-slate-500">Wd ID</dt>
        <dd className="font-mono font-medium text-slate-900">{w.wdId}</dd>
        <dt className="text-sm font-medium text-slate-500">User ID</dt>
        <dd className="font-medium text-slate-900">{w.member.userRef}</dd>
        <dt className="text-sm font-medium text-slate-500">金额 (RM)</dt>
        <dd className="font-medium text-slate-900">{Number(w.amount).toFixed(2)}</dd>
        <dt className="text-sm font-medium text-slate-500">银行/账户</dt>
        <dd className="font-medium text-slate-900">{[w.bankName, w.bankAccount].filter(Boolean).join(" / ") || "—"}</dd>
        <dt className="text-sm font-medium text-slate-500">状态</dt>
        <dd className="font-medium text-slate-900">{w.status}</dd>
        <dt className="text-sm font-medium text-slate-500">创建时间</dt>
        <dd className="font-medium text-slate-900">{w.createdAt.toLocaleString()}</dd>
        <dt className="text-sm font-medium text-slate-500">完成时间</dt>
        <dd className="font-medium text-slate-900">{w.completedAt?.toLocaleString() ?? "—"}</dd>
        <dt className="text-sm font-medium text-slate-500">处理时长(秒)</dt>
        <dd className="font-medium text-slate-900">{w.processingDurationSec ?? "—"}</dd>
        {w.paymentReferenceNo && (
          <>
            <dt className="text-sm font-medium text-slate-500">银行参考号</dt>
            <dd className="font-medium text-slate-900">{w.paymentReferenceNo}</dd>
          </>
        )}
        {w.rejectReason && (
          <>
            <dt className="text-sm font-medium text-slate-500">拒绝原因</dt>
            <dd className="font-medium text-slate-900">{w.rejectReason}</dd>
          </>
        )}
        {w.burnReason && (
          <>
            <dt className="text-sm font-medium text-slate-500">Burn 原因</dt>
            <dd className="font-medium text-slate-900">{w.burnReason}</dd>
          </>
        )}
      </dl>
    </div>
  );
}
