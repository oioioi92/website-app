import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { AdminAgentListClient } from "@/components/admin/AdminAgentListClient";

export const dynamic = "force-dynamic";

export default function AgentsPage() {
  return (
    <div>
      <AdminPageTitle titleKey="admin.agents.pageTitle" subtitleKey="admin.agents.pageDesc" titleFallback="Agent List" subtitleFallback="Members with downlines; L1 count and hierarchy." />
      <AdminAgentListClient />
    </div>
  );
}
