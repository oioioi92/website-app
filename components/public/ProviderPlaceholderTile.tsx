/**
 * When provider.logoUrl is empty: black + gold border + name/abbrev (2–5 chars).
 * Optional subtle gradient by code for variety; keeps "no image" state looking good.
 */
function abbrev(name: string, maxLen = 5): string {
  const s = name.trim().replace(/\s+/g, "").toUpperCase();
  if (s.length <= maxLen) return s || "??";
  return s.slice(0, maxLen);
}

function hueFromCode(code: string | null): number {
  if (!code || !code.length) return 38; // amber default
  let h = 0;
  for (let i = 0; i < code.length; i++) h += code.charCodeAt(i);
  return (h % 36) + 20; // 20–55 range
}

type Props = {
  name: string;
  code?: string | null;
  className?: string;
};

export function ProviderPlaceholderTile({ name, code, className = "" }: Props) {
  const hue = hueFromCode(code ?? null);
  const text = abbrev(name);
  return (
    <div
      className={`flex h-full w-full items-center justify-center rounded-xl bg-black/30 text-center text-[11px] font-black uppercase tracking-wider text-[color:var(--front-gold-light)] md:text-xs ${className}`}
      style={{
        background: `linear-gradient(135deg, rgba(0,0,0,0.85) 0%, hsl(${hue}, 45%, 12%) 100%)`,
        textShadow: "0 0 10px rgba(251,191,36,0.35), 0 0 20px rgba(0,0,0,0.55)"
      }}
      title={name}
    >
      {text}
    </div>
  );
}
