import { AdminAgentListClient } from "@/components/admin/AdminAgentListClient";

export const dynamic = "force-dynamic";

export default function AgentsPage() {
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-2">
        <h1 className="text-xl font-semibold text-slate-800">代理列表</h1>
        <span className="text-sm text-slate-500">有下线的会员，L1 人数与详情层级。</span>
      </div>
      <AdminAgentListClient />
    </div>
  );
}
