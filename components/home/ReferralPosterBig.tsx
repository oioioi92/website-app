"use client";

import Link from "next/link";

/** 左侧 Referral 大海报 + CTA 按钮条 */
export function ReferralPosterBig() {
  return (
    <div className="desk-card flex flex-col overflow-hidden p-0">
      <div
        className="flex min-h-[180px] flex-col justify-end bg-[var(--desk-panel-alt)] p-6"
        style={{
          backgroundImage: "linear-gradient(135deg, var(--desk-panel-alt) 0%, var(--desk-panel) 100%)",
        }}
      >
        <h3 className="m-0 text-xl font-bold text-[var(--desk-accent)]">REFERRAL COMMISSION</h3>
        <p className="mt-1 text-sm text-[var(--desk-text-muted)]">
          Earn passive income. The more you invite, the more you get.
        </p>
        <p className="mt-2 text-xs text-[var(--desk-text-muted)]">
          (Replace with your banner image: 1024×220)
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 p-4">
        <Link href="/#referral" className="flex h-11 items-center justify-center rounded-xl bg-[#dc2626] px-3 text-sm font-semibold text-white shadow hover:bg-[#b91c1c]">
          Share Now
        </Link>
        <Link href="/#referral" className="flex h-11 items-center justify-center rounded-xl bg-[#dc2626] px-3 text-sm font-semibold text-white shadow hover:bg-[#b91c1c]">
          Downline
        </Link>
        <button type="button" className="flex h-11 items-center justify-center rounded-xl border-2 border-[var(--desk-border)] bg-[var(--desk-panel)] px-3 text-sm font-medium text-[var(--desk-text)] hover:border-[var(--desk-accent)]">
          Copy Link
        </button>
        <Link href="/promotion" className="flex h-11 items-center justify-center rounded-xl border-2 border-[var(--desk-border)] bg-[var(--desk-panel)] px-3 text-sm font-medium text-[var(--desk-text)] hover:border-[var(--desk-accent)]">
          More Info
        </Link>
      </div>
    </div>
  );
}
