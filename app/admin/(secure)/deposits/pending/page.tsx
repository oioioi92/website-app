import { AdminPendingDepositsClient } from "@/components/admin/AdminPendingDepositsClient";

export const dynamic = "force-dynamic";

export default function PendingDepositsPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800">待审核入款</h1>
      <p className="mt-1 text-sm text-slate-500">审核通过后将入账钱包</p>
      <AdminPendingDepositsClient />
    </div>
  );
}
