import { DeskCardP44 } from "@/components/public/DeskCardP44";

const reviews = [
  {
    name: "Customer A",
    msg: "Fast response and clear steps. Thank you!",
    time: "1 day ago",
  },
  {
    name: "Customer B",
    msg: "Promotion is easy to claim, UI is smooth.",
    time: "2 days ago",
  },
  {
    name: "Customer C",
    msg: "Support helped me solve the issue quickly.",
    time: "3 days ago",
  },
];

export function ReviewsCard() {
  return (
    <DeskCardP44 title="CUSTOMER REVIEWS" className="h-[260px]">
      <div className="space-y-3">
        {reviews.map((r, i) => (
          <div
            key={i}
            className="rounded-[18px] border-2 border-[var(--desk-border)] bg-[var(--desk-panel-alt)] p-4"
          >
            <div className="flex items-center justify-between">
              <div className="font-semibold text-[var(--desk-text)]">{r.name}</div>
              <div className="text-xs text-[var(--desk-text-muted)]">{r.time}</div>
            </div>
            <div className="mt-2 text-sm text-[var(--desk-text-muted)]">{r.msg}</div>
          </div>
        ))}
      </div>
    </DeskCardP44>
  );
}
