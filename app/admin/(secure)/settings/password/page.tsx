import { redirect } from "next/navigation";

/** 统一入口：Password 以 account/password 为准 */
export default function SettingsPasswordRedirect() {
  redirect("/admin/settings/account/password");
}
