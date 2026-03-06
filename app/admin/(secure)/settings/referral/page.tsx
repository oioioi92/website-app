import { redirect } from "next/navigation";

export default function SettingsReferralRedirect() {
  redirect("/admin/settings/referral/general");
}
