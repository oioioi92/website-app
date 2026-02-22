import { FallbackImage } from "@/components/FallbackImage";

type Social = { id: string; label: string; url: string; iconUrl: string | null };

const iconFallbacks: Record<string, string> = {
  whatsapp: "WA",
  telegram: "TG",
  livechat: "LC",
  facebook: "FB",
  robot: "RB"
};

function fallbackText(label: string) {
  const key = label.trim().toLowerCase();
  return iconFallbacks[key] ?? label.slice(0, 2).toUpperCase();
}

export function SocialButtons3D({ social }: { social: Social[] }) {
  return (
    <section
      data-testid="social-section"
      className="grid grid-cols-3 gap-2 pb-[max(0.25rem,env(safe-area-inset-bottom))] md:grid-cols-5 md:gap-3"
    >
      {social.map((item) => (
        (() => {
          const raw = (item.url ?? "").trim();
          const href = !raw || raw === "#" ? "/chat" : raw;
          const isExternal = !href.startsWith("/");
          return (
        <a
          key={item.id}
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          title={item.label}
          aria-label={item.label}
          className="group flex min-h-11 aspect-square flex-col items-center justify-center rounded-full border border-[color:var(--front-gold)]/45 bg-gradient-to-b from-zinc-700/20 via-zinc-900 to-black p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_7px_14px_rgba(0,0,0,0.45)] transition hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.20),0_10px_18px_rgba(245,158,11,0.18)] active:translate-y-[2px] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_4px_8px_rgba(0,0,0,0.38)]"
        >
          <div className="ui-social-wrap flex items-center justify-center rounded-full border border-[color:var(--front-gold)]/40 bg-black/60">
            {item.iconUrl ? (
              <FallbackImage src={item.iconUrl} alt={item.label} className="ui-asset-img ui-social-icon object-contain" />
            ) : (
              <span className="text-sm font-extrabold tracking-wide text-[color:var(--rb-gold2)]">{fallbackText(item.label)}</span>
            )}
          </div>
          <span className="mt-1 hidden text-[10px] font-semibold text-[color:var(--rb-gold2)]/90 md:block">{item.label}</span>
        </a>
          );
        })()
      ))}
    </section>
  );
}
