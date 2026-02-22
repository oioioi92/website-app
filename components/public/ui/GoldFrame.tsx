import type { ReactNode } from "react";

export function GoldFrame({
  children,
  className = "",
  innerClassName = ""
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <div className={`rounded-2xl bg-gradient-to-b from-[var(--gold2)] via-[var(--gold1)] to-[var(--gold2)] p-[1.5px] shadow-[0_0_24px_var(--goldGlow)] ${className}`}>
      <div className={`rounded-[15px] border border-white/5 bg-gradient-to-b from-[var(--panel2)] to-[var(--panel)] ${innerClassName}`}>
        {children}
      </div>
    </div>
  );
}
