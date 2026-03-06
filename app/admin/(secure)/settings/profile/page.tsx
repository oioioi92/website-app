import { redirect } from "next/navigation";

/** 统一入口：Profile 以 account/profile 为准 */
export default function SettingsProfileRedirect() {
  redirect("/admin/settings/account/profile");
}
