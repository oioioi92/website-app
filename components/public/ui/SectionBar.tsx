import type { ReactNode } from "react";

export function SectionBar({
  title,
  right
}: {
  title: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between rounded-xl border border-[color:var(--front-gold)]/30 bg-black/35 px-3 py-2">
      <p className="text-sm font-extrabold tracking-wide text-[color:var(--front-gold-light)]">{title}</p>
      {right ? <div>{right}</div> : null}
    </div>
  );
}
