import { redirect } from "next/navigation";

export default function SettingsLoginHistoryRedirect() {
  redirect("/admin/settings/account/login-history");
}
