import { DeskCardP44 } from "@/components/public/DeskCardP44";

export function ComplianceCard() {
  return (
    <DeskCardP44 title="SECURITY & POLICY" className="flex h-[260px] flex-col">
      <ul className="space-y-3 text-sm text-[var(--desk-text-muted)]">
        <li className="rounded-[18px] border-2 border-[var(--desk-border)] bg-[var(--desk-panel-alt)] p-4">
          Security: account protection + audit
        </li>
        <li className="rounded-[18px] border-2 border-[var(--desk-border)] bg-[var(--desk-panel-alt)] p-4">
          Responsible: limits & self-control tools
        </li>
        <li className="rounded-[18px] border-2 border-[var(--desk-border)] bg-[var(--desk-panel-alt)] p-4">
          Privacy: data handling & retention policy
        </li>
      </ul>
      <div className="mt-auto text-xs text-[var(--desk-text-muted)]">
        Keep it short here. Full policy goes to dedicated pages.
      </div>
    </DeskCardP44>
  );
}
