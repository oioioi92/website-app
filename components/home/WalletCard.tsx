import Link from "next/link";
import { DeskCardP44 } from "@/components/public/DeskCardP44";

export function WalletCard() {
  return (
    <DeskCardP44 title="WALLET" className="h-[260px] flex flex-col">
      <div className="space-y-3">
        <Row label="Balance" value="RM 0.00" />
        <Row label="Winover" value="RM 0.00" />
        <Row label="Surrender" value="—" />
      </div>

      <div className="mt-auto flex gap-3">
        <Link href="/deposit" className="desk-btn-primary flex-1 text-center leading-10">
          Deposit
        </Link>
        <Link href="/withdraw" className="desk-btn-secondary flex-1 text-center leading-10">
          Withdraw
        </Link>
      </div>
    </DeskCardP44>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex h-11 items-center justify-between rounded-[18px] border-2 border-[var(--desk-border)] bg-[var(--desk-panel-alt)] px-4">
      <div className="text-sm text-[var(--desk-text-muted)]">{label}</div>
      <div className="text-sm font-semibold text-[var(--desk-text)]">{value}</div>
    </div>
  );
}
