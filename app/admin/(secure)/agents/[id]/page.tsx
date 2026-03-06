import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { AdminAgentDownlineTable } from "@/components/admin/AdminAgentDownlineTable";

export const dynamic = "force-dynamic";

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = await db.member.findUnique({
    where: { id },
    include: {
      referrals: {
        include: {
          promoClaims: {
            where: { status: "APPROVED" },
            select: { amountGranted: true }
          }
        }
      }
    }
  });
  if (!agent) notFound();

  const l1 = agent.referrals;
  const freeCredit = (ref: { promoClaims: { amountGranted: unknown }[] }) =>
    ref.promoClaims.reduce((s, c) => s + Number(c.amountGranted ?? 0), 0);

  const l1Rows = l1.map((r) => ({
    id: r.id,
    userRef: r.userRef,
    displayName: r.displayName,
    register_at: r.createdAt.toISOString(),
    last_deposit_at: r.lastDepositAt?.toISOString() ?? null,
    free_credit: freeCredit(r),
    deposit_count: r.depositCount,
    withdraw_count: r.withdrawCount
  }));

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3">
        <Link href="/admin/agents" className="text-sky-600 hover:underline font-medium">← 代理列表</Link>
      </div>
      <div className="flex flex-wrap items-baseline gap-2">
        <h1 className="text-xl font-semibold text-slate-800">代理详情</h1>
        <span className="text-xs text-amber-700">佣金仅按 L1 计算</span>
      </div>
      <dl className="mt-3 grid gap-x-6 gap-y-1.5 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <dt className="text-slate-500 text-xs font-medium">User ID</dt>
        <dd className="font-mono text-sm font-medium text-slate-900">{agent.userRef}</dd>
        <dt className="text-slate-500 text-xs font-medium">名称</dt>
        <dd className="text-sm font-medium text-slate-900">{agent.displayName ?? "—"}</dd>
        <dt className="text-slate-500 text-xs font-medium">推荐码</dt>
        <dd className="text-sm font-medium text-slate-900">{agent.referralCode ?? "—"}</dd>
        <dt className="text-slate-500 text-xs font-medium">L1 人数</dt>
        <dd className="text-sm font-medium text-slate-900">{l1.length}</dd>
        <dt className="text-slate-500 text-xs font-medium">总入款笔数</dt>
        <dd className="text-sm font-medium text-slate-900">{l1.reduce((s, r) => s + r.depositCount, 0)}</dd>
        <dt className="text-slate-500 text-xs font-medium">总提款笔数</dt>
        <dd className="text-sm font-medium text-slate-900">{l1.reduce((s, r) => s + r.withdrawCount, 0)}</dd>
      </dl>
      <AdminAgentDownlineTable title="Level 1 下线（直接下线，佣金按此层计算）" rows={l1Rows} />
    </div>
  );
}
