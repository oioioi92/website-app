import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "danger" | "success";

const variantMap: Record<Variant, string> = {
  primary:
    "border-[color:var(--front-gold)]/70 bg-gradient-to-b from-[color:var(--front-gold)]/30 to-[color:var(--front-gold)]/25 text-[color:var(--front-gold-light)] shadow-[0_0_18px_rgba(245,158,11,0.25)]",
  danger:
    "border-[color:var(--front-danger)]/60 bg-gradient-to-b from-[color:var(--front-danger)]/30 to-[color:var(--front-danger)]/20 text-[color:var(--front-danger-light)] shadow-[0_0_14px_rgba(244,63,94,0.18)]",
  success:
    "border-[color:var(--front-success)]/60 bg-gradient-to-b from-[color:var(--front-success)]/30 to-[color:var(--front-success)]/20 text-[color:var(--front-success-light)] shadow-[0_0_14px_rgba(16,185,129,0.18)]"
};

export function GoldButton({
  children,
  className = "",
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: Variant }) {
  return (
    <button
      {...props}
      className={`rounded-xl border px-3 py-2 text-sm font-bold transition hover:brightness-110 active:translate-y-[1px] ${variantMap[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
