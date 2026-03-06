import { AdminPendingWithdrawalsClient } from "@/components/admin/AdminPendingWithdrawalsClient";

export const dynamic = "force-dynamic";

export default function PendingWithdrawalsPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800">待处理提款</h1>
      <p className="mt-1 text-sm text-slate-500">待审核的提款申请</p>
      <AdminPendingWithdrawalsClient />
    </div>
  );
}
