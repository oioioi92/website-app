import { AdminDepositListClient } from "@/components/admin/AdminDepositListClient";

export const dynamic = "force-dynamic";

export default function DepositListPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800">入款记录</h1>
      <p className="mt-1 text-sm text-slate-500">全部入款申请与状态</p>
      <AdminDepositListClient />
    </div>
  );
}
