import { AdminDashboardSummary } from "@/components/admin/AdminDashboardSummary";
import { AdminDashboardWhatsAppStatus } from "@/components/admin/AdminDashboardWhatsAppStatus";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  return (
    <div className="admin-page-content">
      <header className="admin-page-title">
        <h1>Dashboard</h1>
        <p>概览与快捷入口</p>
      </header>
      <div className="mb-6">
        <AdminDashboardWhatsAppStatus />
      </div>
      <AdminDashboardSummary />
    </div>
  );
}
