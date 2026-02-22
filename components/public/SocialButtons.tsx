import { SocialButtons3D } from "@/components/public/SocialButtons3D";
import { FallbackImage } from "@/components/FallbackImage";
import type { ThemeConfig } from "@/lib/public/theme";

type Social = { id: string; label: string; url: string; iconUrl: string | null };

export function SocialButtons({
  social,
  style
}: {
  social: Social[];
  style: ThemeConfig["socialStyle"];
}) {
  if (style === "CUBE") return <SocialButtons3D social={social} />;
  return (
    <section data-testid="social-section" className="grid grid-cols-3 gap-2 md:grid-cols-5 md:gap-3">
      {social.map((item) => {
        const raw = (item.url ?? "").trim();
        const href = !raw || raw === "#" ? "/chat" : raw;
        const isExternal = !href.startsWith("/");
        return (
          <a
            key={item.id}
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="group flex min-h-11 aspect-square items-center justify-center rounded-full border border-[color:var(--front-gold)]/50 bg-gradient-to-b from-[color:var(--front-gold)]/25 via-[color:var(--front-gold)]/15 to-black shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_0_12px_var(--goldGlow)]"
            title={item.label}
          >
            {item.iconUrl ? (
              <FallbackImage src={item.iconUrl} alt={item.label} className="h-6 w-6 object-contain" />
            ) : (
              <span className="text-xs font-black text-[color:var(--front-gold-light)]">{item.label.slice(0, 2).toUpperCase()}</span>
            )}
          </a>
        );
      })}
    </section>
  );
}
