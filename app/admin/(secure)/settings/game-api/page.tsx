import { redirect } from "next/navigation";

export default function SettingsGameApiRedirect() {
  redirect("/admin/settings/game-providers");
}
