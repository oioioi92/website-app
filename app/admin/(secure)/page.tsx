import { AdminDashboardSummary } from "@/components/admin/AdminDashboardSummary";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  return (
    <div>
      <AdminDashboardSummary />
    </div>
  );
}
