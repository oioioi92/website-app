import Link from "next/link";
import { DeskCardP44 } from "@/components/public/DeskCardP44";

export function NoticeBar() {
  return (
    <DeskCardP44 className="py-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-[var(--desk-text-muted)]">
          Notice: Promotions update daily. Please check Bonus/Promotion page for latest campaigns.
        </div>
        <Link
          href="/promotion"
          className="text-sm text-[var(--desk-accent)] hover:underline"
        >
          View Promotions →
        </Link>
      </div>
    </DeskCardP44>
  );
}
