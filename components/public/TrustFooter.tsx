import { FallbackImage } from "@/components/FallbackImage";

type TrustBadge = { group: string; imageUrl: string; title?: string | null };

const defaultGroups = ["Game License", "Certification & Security", "Payment Methods", "Follow Social Media"];

export function TrustFooter({ badges, groups }: { badges: TrustBadge[]; groups?: string[] }) {
  const groupNames = (groups && groups.length > 0 ? groups : defaultGroups).slice(0, 12);
  const list = groupNames.map((group) => ({
    group,
    items: badges.filter((b) => b.group.toLowerCase() === group.toLowerCase())
  }));
  return (
    <section className="rb-card px-4 py-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {list.map(({ group, items }) => (
          <div key={group} className="rounded-xl border border-white/10 bg-black/25 p-3">
            <p className="text-xs font-bold tracking-wide text-[color:var(--rb-gold2)]">{group}</p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {items.length > 0
                ? items.map((item, idx) => (
                    <div key={`${group}-${idx}`} className="ui-trust-tile flex items-center justify-center rounded border border-white/10 bg-black/40 p-1">
                      <FallbackImage
                        src={item.imageUrl}
                        alt={item.title ?? group}
                        className="ui-asset-img ui-trust-img object-contain"
                      />
                    </div>
                  ))
                : Array.from({ length: 4 }).map((_, idx) => (
                    <div key={`${group}-empty-${idx}`} className="ui-trust-tile rounded border border-white/10 bg-black/20" />
                  ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
