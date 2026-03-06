import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { AdminPendingWithdrawalsClient } from "@/components/admin/AdminPendingWithdrawalsClient";

export const dynamic = "force-dynamic";

export default function PendingWithdrawalsPage() {
  return (
    <div>
      <AdminPageTitle titleKey="admin.pendingWith.pageTitle" subtitleKey="admin.pendingWith.pageDesc" titleFallback="Pending Withdrawals" subtitleFallback="Withdrawal applications to be reviewed" />
      <AdminPendingWithdrawalsClient />
    </div>
  );
}
