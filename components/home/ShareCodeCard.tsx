"use client";

import { DeskCardP44 } from "@/components/public/DeskCardP44";
import { useState } from "react";

export function ShareCodeCard() {
  const [code] = useState("ABC123");

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      alert("Copied!");
    } catch {
      alert("Copy failed");
    }
  };

  return (
    <DeskCardP44 title="SHARE YOUR CODE" className="flex h-[260px] flex-col">
      <div className="text-sm text-[var(--desk-text-muted)]">Your referral code</div>

      <div className="mt-2 flex h-12 items-center justify-between rounded-[18px] border-2 border-[var(--desk-border)] bg-[var(--desk-panel-alt)] px-4">
        <div className="font-semibold text-[var(--desk-text)]">{code}</div>
        <button
          type="button"
          className="desk-btn-secondary h-10 px-4"
          onClick={onCopy}
        >
          Copy
        </button>
      </div>

      <div className="mt-4 flex h-[110px] items-center justify-center rounded-[18px] border-2 border-[var(--desk-border)] bg-[var(--desk-panel-alt)] text-sm text-[var(--desk-text-muted)]">
        QR Placeholder
      </div>

      <div className="mt-auto flex gap-3">
        <a href="#" className="desk-btn-secondary flex-1 text-center leading-10">
          Share Telegram
        </a>
        <a href="#" className="desk-btn-secondary flex-1 text-center leading-10">
          Share WhatsApp
        </a>
      </div>
    </DeskCardP44>
  );
}
