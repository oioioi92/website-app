import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { AdminPendingDepositsClient } from "@/components/admin/AdminPendingDepositsClient";

export const dynamic = "force-dynamic";

export default function PendingDepositsPage() {
  return (
    <div>
      <AdminPageTitle titleKey="admin.pendingDepo.pageTitle" subtitleKey="admin.pendingDepo.pageDesc" titleFallback="Pending Deposit" subtitleFallback="After approval, amount will be credited to wallet." />
      <AdminPendingDepositsClient />
    </div>
  );
}
