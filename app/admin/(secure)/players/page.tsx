import { AdminPlayerListClient } from "@/components/admin/AdminPlayerListClient";

export const dynamic = "force-dynamic";

export default function PlayersPage() {
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-2">
        <h1 className="text-xl font-semibold text-slate-800">玩家列表</h1>
        <span className="text-sm text-slate-500">顾客资料与经营指标。每位顾客支持：Chat 直接发信息，Wallet 进入其前台代操作。</span>
      </div>
      <AdminPlayerListClient />
    </div>
  );
}
