import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { AdminPlayerListClient } from "@/components/admin/AdminPlayerListClient";

export const dynamic = "force-dynamic";

export default function PlayersPage() {
  return (
    <div>
      <AdminPageTitle titleKey="admin.players.pageTitle" subtitleKey="admin.players.pageDesc" titleFallback="Player List" subtitleFallback="Customer profiles and metrics." />
      <AdminPlayerListClient />
    </div>
  );
}
