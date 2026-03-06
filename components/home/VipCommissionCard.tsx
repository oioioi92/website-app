import { DeskCardP44 } from "@/components/public/DeskCardP44";

const rows = [
  { vip: "VIP 1", rate: "0.5%" },
  { vip: "VIP 2", rate: "0.8%" },
  { vip: "VIP 3", rate: "1.0%" },
  { vip: "VIP 4", rate: "1.2%" },
  { vip: "VIP 5", rate: "1.5%" },
];

export function VipCommissionCard() {
  return (
    <DeskCardP44 title="VIP COMMISSION" className="flex h-[260px] flex-col">
      <div className="overflow-hidden rounded-[18px] border-2 border-[var(--desk-border)] bg-[var(--desk-panel-alt)]">
        <div className="grid grid-cols-2 items-center bg-black/20 px-4 font-semibold text-sm h-10">
          <div>Tier</div>
          <div>Rate</div>
        </div>
        {rows.map((r) => (
          <div
            key={r.vip}
            className="grid grid-cols-2 items-center border-t border-[var(--desk-border)] px-4 text-sm h-10 text-[var(--desk-text-muted)]"
          >
            <div className="text-[var(--desk-text)]">{r.vip}</div>
            <div>{r.rate}</div>
          </div>
        ))}
      </div>

      <div className="mt-auto text-xs text-[var(--desk-text-muted)]">
        Replace with your real VIP table + explanation in drawer/modal if long.
      </div>
    </DeskCardP44>
  );
}
