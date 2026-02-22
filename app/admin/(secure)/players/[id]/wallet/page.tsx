import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PlayerWalletPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await db.member.findUnique({
    where: { id },
    include: {
      walletTx: { orderBy: { happenedAt: "desc" }, take: 50 }
    }
  });
  if (!member) notFound();

  const balanceResult = await db.walletTransaction.aggregate({
    where: { memberId: id },
    _sum: { amountSigned: true }
  });
  const balance = Number(balanceResult._sum.amountSigned ?? 0);

  return (
    <div>
      <div className="mb-2">
        <Link href="/admin/players" className="font-medium text-sky-600 hover:underline">← 玩家列表</Link>
      </div>
      <h1 className="text-xl font-semibold text-slate-800">该顾客前台 · 钱包代操作</h1>
      <p className="mt-1 text-sm text-slate-500">
        进入此页即进入该顾客前台视角，可查看余额与流水；代操作（加款/扣款）在此实现并写 AuditLog（entityType=PLAYER_WALLET_ENTRY）。
      </p>
      <dl className="mt-4 grid gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2">
        <dt className="text-sm font-medium text-slate-500">User ID</dt>
        <dd className="font-mono font-medium text-slate-900">{member.userRef}</dd>
        <dt className="text-sm font-medium text-slate-500">Main Wallet (RM)</dt>
        <dd className="font-semibold text-slate-900">{balance.toFixed(2)}</dd>
      </dl>
      <h2 className="mt-4 text-lg font-semibold text-slate-800">最近流水（最多 50 笔）</h2>
      <div className="mt-2 overflow-hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-[15px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/90">
              <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-800">时间</th>
              <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-800">类型</th>
              <th className="px-4 py-3.5 text-right text-[13px] font-semibold uppercase tracking-wide text-slate-800">金额</th>
              <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-800">渠道/Ref</th>
            </tr>
          </thead>
          <tbody>
            {member.walletTx.map((t) => (
              <tr key={t.id} className="border-b border-slate-100">
                <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{t.happenedAt.toLocaleString()}</td>
                <td className="px-4 py-3 font-medium text-slate-900">{t.type}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-slate-900">{Number(t.amountSigned).toFixed(2)}</td>
                <td className="px-4 py-3 font-medium text-slate-900">{[t.channel, t.refNo].filter(Boolean).join(" / ") || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
