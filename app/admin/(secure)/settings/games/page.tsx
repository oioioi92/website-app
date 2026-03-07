import { redirect } from "next/navigation";

export default function AdminSettingsGamesRedirect() {
  redirect("/admin/settings/game-providers");
}
