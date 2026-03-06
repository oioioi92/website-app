import { TransactionsPageClient } from "@/components/admin/TransactionsPageClient";
import { TX_PRESETS } from "@/config/transactions.presets";

export const dynamic = "force-dynamic";

export default function AdminTransactionsPage() {
  return (
    <div>
      <h1 className="text-lg font-semibold text-[var(--compact-text)]">Transactions</h1>
      <p className="mt-0.5 text-[13px] text-[var(--compact-muted)]">统一流水：All / Deposit / Withdraw / Bonus / Transfer / Game / Adjust</p>
      <TransactionsPageClient presets={TX_PRESETS} />
    </div>
  );
}
