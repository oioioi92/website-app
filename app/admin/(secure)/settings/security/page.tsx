import { redirect } from "next/navigation";

export default function SettingsSecurityRedirect() {
  redirect("/admin/settings/account/security");
}
