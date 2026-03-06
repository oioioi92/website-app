import Link from "next/link";
import { PaymentGatewaySettingsClient } from "@/components/admin/PaymentGatewaySettingsClient";

export const dynamic = "force-dynamic";

export default function AdminSettingsPaymentGatewayPage() {
  return (
    <div>
      <div className="flex items-center gap-2 text-[13px] text-[var(--compact-muted)]">
        <Link href="/admin/settings" className="hover:text-[var(--compact-primary)]">Settings</Link>
        <span>/</span>
        <span>Payment Gateway</span>
      </div>
      <h1 className="mt-2 text-lg font-semibold text-[var(--compact-text)]">Payment Gateway</h1>
      <p className="mt-0.5 text-[13px] text-[var(--compact-muted)]">入款支付网关 / 渠道配置</p>
      <div className="mt-6">
        <PaymentGatewaySettingsClient />
      </div>
    </div>
  );
}
