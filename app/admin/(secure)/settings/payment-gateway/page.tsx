"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";
import { PaymentGatewaySettingsClient } from "@/components/admin/PaymentGatewaySettingsClient";

export default function AdminSettingsPaymentGatewayPage() {
  const { t } = useLocale();
  return (
    <div>
      <div className="flex items-center gap-2 text-[13px] text-[var(--compact-muted)]">
        <Link href="/admin/settings" className="hover:text-[var(--compact-primary)]">{t("admin.settingsPaymentGateway.breadcrumbSettings")}</Link>
        <span>/</span>
        <span>{t("admin.settingsPaymentGateway.breadcrumbPaymentGateway")}</span>
      </div>
      <h1 className="mt-2 text-lg font-semibold text-[var(--compact-text)]">{t("admin.settingsPaymentGateway.title")}</h1>
      <p className="mt-0.5 text-[13px] text-[var(--compact-muted)]">{t("admin.settingsPaymentGateway.pageDesc")}</p>
      <div className="mt-6">
        <PaymentGatewaySettingsClient />
      </div>
    </div>
  );
}
