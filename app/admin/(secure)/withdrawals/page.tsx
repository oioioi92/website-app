import { AdminWithdrawalListClient } from "@/components/admin/AdminWithdrawalListClient";

export const dynamic = "force-dynamic";

export default function WithdrawalListPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800">提款记录</h1>
      <p className="mt-1 text-sm text-slate-500">全部提款申请与状态</p>
      <AdminWithdrawalListClient />
    </div>
  );
}
