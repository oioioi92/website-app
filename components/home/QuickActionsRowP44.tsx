import Link from "next/link";
import { DeskCardP44 } from "@/components/public/DeskCardP44";

const actions = [
  { label: "Deposit", href: "/deposit" },
  { label: "Withdraw", href: "/withdraw" },
  { label: "Transfer", href: "/deposit" },
  { label: "Support", href: "/live-chat" },
];

export function QuickActionsRowP44() {
  return (
    <DeskCardP44>
      <div className="grid grid-cols-4 gap-6">
        {actions.map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className="flex h-[88px] items-center justify-center rounded-[22px] border-2 border-[var(--desk-border)] bg-[var(--desk-panel-alt)] font-semibold text-[var(--desk-text)] hover:border-[var(--desk-accent)]"
          >
            {a.label}
          </Link>
        ))}
      </div>
    </DeskCardP44>
  );
}
