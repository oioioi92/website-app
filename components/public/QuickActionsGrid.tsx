import { FallbackImage } from "@/components/FallbackImage";
import { GoldFrame } from "@/components/public/ui/GoldFrame";
import { SectionBar } from "@/components/public/ui/SectionBar";
import type { ThemeConfig } from "@/lib/public/theme";
import { resolveUiAssetByName } from "@/lib/public/namedAssets";

export function QuickActionsGrid({
  actions,
  title = "QUICK ACTIONS"
}: {
  actions: ThemeConfig["quickActions"];
  title?: string;
}) {
  const list = actions.slice(0, 6);
  if (list.length === 0) return null;
  return (
    <div data-frontedit="quickActions">
      <GoldFrame innerClassName="p-3">
        <SectionBar title={title} />
        <div className="ui-qa-grid">
          {list.map((item, idx) => {
            const iconSrc = item.iconUrl ?? resolveUiAssetByName(item.label) ?? resolveUiAssetByName(item.iconKey);
            const isPrimary = item.label.toUpperCase().includes("TIPS");
            return (
              <a
                key={`${item.label}-${idx}`}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className={`ui-qa-capsule ${isPrimary ? "primary" : ""}`}
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                  {iconSrc ? (
                    <FallbackImage src={iconSrc} alt={item.label} className="ui-asset-img h-full w-full object-contain" />
                  ) : (
                    <span className="text-[color:var(--front-gold)]/70 text-[8px]" aria-hidden>
                      ●
                    </span>
                  )}
                </div>
                <span className="truncate uppercase">{item.label}</span>
              </a>
            );
          })}
        </div>
      </GoldFrame>
    </div>
  );
}
