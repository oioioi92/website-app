"use client";

import { useLocale } from "@/lib/i18n/context";
import { SettingsPageShell } from "@/components/admin/SettingsPageShell";
import { PromotionListSettingsClient } from "@/components/admin/PromotionListSettingsClient";

export default function PromotionListSettingsPage() {
  const { t } = useLocale();
  return (
    <SettingsPageShell
      breadcrumbs={[
        { label: "Promotion Center", href: "/admin/settings/promotions/list" },
        { label: "List" },
      ]}
      title="Promotion List"
      subtitle="活动列表：启停、排序、进入 Media / Links / Preview / 编辑。行内无 Content，Content 与 Layout 仅在本组导航。"
    >
      <PromotionListSettingsClient />
    </SettingsPageShell>
  );
}
