import Link from "next/link";
import { WithdrawRulesSettingsClient } from "@/components/admin/WithdrawRulesSettingsClient";

export default function SettingsFinanceWithdrawRulesPage() {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 text-[13px] text-[var(--compact-muted)]">
        <Link href="/admin/settings" className="hover:text-[var(--compact-primary)]">Settings</Link>
        <span>/</span>
        <span>Finance</span>
        <span>/</span>
        <span>Withdraw Rules</span>
      </div>
      <h1 className="mt-2 text-lg font-semibold text-[var(--compact-text)]">Withdraw Rules</h1>
      <p className="mt-0.5 text-[13px] text-[var(--compact-muted)]">提现规则配置（限额、每日次数等）</p>
      <div className="mt-6">
        <WithdrawRulesSettingsClient />
      </div>
    </div>
  );
}
