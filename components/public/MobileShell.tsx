import type { ReactNode } from "react";
import { AnnouncementMarquee } from "@/components/public/AnnouncementMarquee";
import { AgeGateModal } from "@/components/public/AgeGateModal";
import { DownloadAppBar } from "@/components/public/DownloadAppBar";
import { LiveChatFab } from "@/components/public/LiveChatFab";
import { MobileTopBar } from "@/components/public/MobileTopBar";
import { MobileBottomNav } from "@/components/public/MobileBottomNav";
import type { ThemeConfig } from "@/lib/public/theme";

export function MobileShell({
  children,
  theme,
  chatUrl,
  socialLinks
}: {
  children: ReactNode;
  theme: ThemeConfig;
  chatUrl: string;
  socialLinks?: Array<{ label: string; url: string }>;
}) {
  const t = theme.uiText ?? {};
  return (
    <div className="min-h-screen w-full min-w-0 bg-[color:var(--p44-grey-bg)] text-white">
      <div data-frontedit="header">
        <MobileTopBar logoUrl={theme.logoUrl} partnershipBadgeUrl={theme.partnershipBadgeUrl} siteName={theme.siteName} />
      </div>
      <div data-frontedit="marquee">
        <AnnouncementMarquee
          text={theme.announcementMarqueeText ?? (t.marqueedefaulttext ?? "Welcome — Latest promotions and updates")}
          messages={theme.marqueeMessages}
        />
      </div>
      <div className="w-full min-w-0 pb-[max(7rem,calc(7rem+env(safe-area-inset-bottom,0px)))] md:pb-8">{children}</div>
      <AgeGateModal ageGate={theme.ageGate} uiText={t} />
      <DownloadAppBar theme={theme} />
      <LiveChatFab chatUrl={chatUrl} uiText={t} socialLinks={socialLinks ?? []} />
      <MobileBottomNav chatUrl={chatUrl} theme={theme} />
    </div>
  );
}
