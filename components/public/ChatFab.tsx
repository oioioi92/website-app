"use client";

import { FallbackImage } from "@/components/FallbackImage";
import { resolveUiAssetByName } from "@/lib/public/namedAssets";

export function ChatFab({ chatUrl, label }: { chatUrl: string; label?: string }) {
  if (!chatUrl || chatUrl === "#") return null;
  const icon = resolveUiAssetByName("chat") ?? resolveUiAssetByName("livechat");
  const labelText = label && label.trim().length > 0 ? label.trim() : "Live chat";
  const href = chatUrl.trim();
  const isExternal = /^https?:\/\//i.test(href);

  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="ui-chat-fab fixed bottom-[96px] right-3 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--front-gold)]/45 bg-black/65 shadow-[0_10px_24px_rgba(0,0,0,0.55)] backdrop-blur lg:bottom-[28px]"
      aria-label={labelText}
      title={labelText}
    >
      {icon ? (
        <FallbackImage src={icon} alt="chat" className="h-6 w-6 object-contain" loading="eager" />
      ) : (
        <span className="text-sm font-extrabold text-[color:var(--rb-gold2)]">C</span>
      )}
    </a>
  );
}

