import type { ThemeConfig } from "@/lib/public/theme";

export function FloatingSideActions({ actions }: { actions: ThemeConfig["floatingActions"] }) {
  if (actions.length === 0) return null;
  return (
    <div className="fixed bottom-[140px] right-1 z-30 flex flex-col gap-2 lg:bottom-auto lg:right-2 lg:top-1/2 lg:-translate-y-1/2">
      {actions.map((item, idx) => (
        <a
          key={`${item.label}-${idx}`}
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className={`rounded-l-xl border px-2 py-1.5 text-[10px] font-bold shadow-[0_0_14px_rgba(0,0,0,0.45)] lg:px-3 lg:py-2 lg:text-xs ${
            item.variant === "complain"
              ? "border-[color:var(--front-danger)]/50 bg-[color:var(--front-danger)]/30 text-[color:var(--front-danger-light)]"
              : "border-[color:var(--front-gold)]/50 bg-[color:var(--front-gold)]/25 text-[color:var(--front-gold-light)]"
          }`}
        >
          {item.label}
        </a>
      ))}
    </div>
  );
}
