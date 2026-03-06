"use client";

import Link from "next/link";

/** 右栏控制台：Login/Register 大按钮 + Balance/Winover + Deposit/Withdraw/Transfer/Refresh（与参考站同位置） */
export function RightControlPanelP44() {
  return (
    <div className="desk-card flex flex-col gap-4">
      <div className="flex gap-2">
        <Link
          href="/login"
          className="flex flex-1 items-center justify-center rounded-xl bg-[var(--desk-accent)] py-3 text-sm font-semibold text-black shadow hover:opacity-90"
        >
          Login
        </Link>
        <Link
          href="/register-wa"
          className="flex flex-1 items-center justify-center rounded-xl bg-[#dc2626] py-3 text-sm font-semibold text-white shadow hover:bg-[#b91c1c]"
        >
          Register
        </Link>
      </div>

      <div className="space-y-2 border-t border-[var(--desk-border)] pt-3">
        <Row label="Balance" value="RM 0.00" />
        <Row label="Winover" value="RM 0.00" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link href="/deposit" className="flex h-10 items-center justify-center rounded-xl border-2 border-[var(--desk-border)] bg-[var(--desk-panel)] text-sm font-medium text-[var(--desk-text)] hover:border-[var(--desk-accent)]">
          Deposit
        </Link>
        <Link href="/withdraw" className="flex h-10 items-center justify-center rounded-xl border-2 border-[var(--desk-border)] bg-[var(--desk-panel)] text-sm font-medium text-[var(--desk-text)] hover:border-[var(--desk-accent)]">
          Withdraw
        </Link>
        <Link href="/deposit" className="flex h-10 items-center justify-center rounded-xl border-2 border-[var(--desk-border)] bg-[var(--desk-panel)] text-sm font-medium text-[var(--desk-text)] hover:border-[var(--desk-accent)]">
          Transfer
        </Link>
        <button type="button" className="flex h-10 items-center justify-center rounded-xl border-2 border-[var(--desk-border)] bg-[var(--desk-panel)] text-sm font-medium text-[var(--desk-text)] hover:border-[var(--desk-accent)]">
          Refresh
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex h-9 items-center justify-between rounded-lg border border-[var(--desk-border)] bg-[var(--desk-panel-alt)] px-3">
      <span className="text-xs text-[var(--desk-text-muted)]">{label}</span>
      <span className="text-sm font-semibold text-[var(--desk-text)]">{value}</span>
    </div>
  );
}
