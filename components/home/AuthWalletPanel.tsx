"use client";

import Link from "next/link";

/** 右侧控制台：Login/Register + Balance/Winover/Surrender + 动作按钮 */
export function AuthWalletPanel() {
  return (
    <div className="desk-card flex flex-col space-y-4">
      <div className="flex gap-3">
        <Link href="/login" className="desk-btn-primary flex-1 text-center text-sm">
          Login
        </Link>
        <Link href="/register-wa" className="desk-btn-secondary flex-1 text-center text-sm">
          Register
        </Link>
      </div>

      <div className="space-y-2 border-t-2 border-[var(--desk-border)] pt-4">
        <Row label="Balance" value="RM 0.00" />
        <Row label="Winover" value="RM 0.00" />
        <div className="flex items-center justify-between rounded-[14px] border-2 border-[var(--desk-border)] bg-[var(--desk-panel-alt)] px-4 py-2">
          <span className="text-sm text-[var(--desk-text-muted)]">Surrender</span>
          <button type="button" className="text-sm font-semibold text-[var(--desk-accent)] hover:underline">
            —
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link href="/deposit" className="desk-btn-primary h-10 min-h-0 text-center text-xs">
          Deposit
        </Link>
        <Link href="/withdraw" className="desk-btn-secondary h-10 min-h-0 text-center text-xs">
          Withdraw
        </Link>
        <Link href="/deposit" className="desk-btn-secondary h-10 min-h-0 text-center text-xs">
          Transfer
        </Link>
        <button type="button" className="desk-btn-secondary h-10 min-h-0 text-xs">
          Refresh
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex h-10 items-center justify-between rounded-[14px] border-2 border-[var(--desk-border)] bg-[var(--desk-panel-alt)] px-4">
      <span className="text-sm text-[var(--desk-text-muted)]">{label}</span>
      <span className="text-sm font-semibold text-[var(--desk-text)]">{value}</span>
    </div>
  );
}
