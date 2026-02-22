import Link from "next/link";
import { BankSettingsClient } from "@/components/admin/BankSettingsClient";

export const dynamic = "force-dynamic";

export default function AdminSettingsBankPage() {
  return (
    <div>
      <div className="flex items-center gap-2 text-[13px] text-[var(--compact-muted)]">
        <Link href="/admin/settings" className="hover:text-[var(--compact-primary)]">Settings</Link>
        <span>/</span>
        <span>Bank</span>
      </div>
      <h1 className="mt-2 text-lg font-semibold text-[var(--compact-text)]">Bank</h1>
      <p className="mt-0.5 text-[13px] text-[var(--compact-muted)]">出款银行账户、限额、维护开关</p>
      <div className="mt-6">
        <BankSettingsClient />
      </div>
    </div>
  );
}
