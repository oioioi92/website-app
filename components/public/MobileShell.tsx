import type { ReactNode } from "react";
import { AnnouncementMarquee } from "@/components/public/AnnouncementMarquee";
import { AgeGateModal } from "@/components/public/AgeGateModal";
import { DownloadAppBar } from "@/components/public/DownloadAppBar";
import { LiveChatFab } from "@/components/public/LiveChatFab";
import { MobileTopBar } from "@/components/public/MobileTopBar";
import { MobileBottomNav } from "@/components/public/MobileBottomNav";
import { VividBottomNav } from "@/components/vivid/VividBottomNav";
import type { ThemeConfig } from "@/lib/public/theme";

export function MobileShell({
  children,
  theme,
  chatUrl,
  socialLinks,
  useVividPortal = false,
}: {
  children: ReactNode;
  theme: ThemeConfig;
  chatUrl: string;
  socialLinks?: Array<{ label: string; url: string }>;
  /** 为 true 时在 layout 层统一渲染 Vivid 底部 bar，所有前台页都显示 */
  useVividPortal?: boolean;
}) {
  const t = theme.uiText ?? {};
  const contentClass =
    "w-full min-w-0 pb-[max(7rem,calc(7rem+env(safe-area-inset-bottom,0px)))] md:pb-8" +
    (useVividPortal ? " vivid-nav-spacer" : "");
  const rootStyle: React.CSSProperties & Record<string, string> = {};
  if (theme.pageBackgroundColor) rootStyle.backgroundColor = theme.pageBackgroundColor;
  if (theme.pageBackgroundUrl) {
    rootStyle.backgroundImage = `url(${theme.pageBackgroundUrl})`;
    rootStyle.backgroundSize = "cover";
    rootStyle.backgroundPosition = "center";
    rootStyle.backgroundAttachment = "fixed";
  }
  if (theme.themePrimaryColor) rootStyle["--theme-primary"] = theme.themePrimaryColor;
  if (theme.themeAccentColor) rootStyle["--theme-accent"] = theme.themeAccentColor;
  const hasCustomPageBg = Boolean(theme.pageBackgroundUrl || theme.pageBackgroundColor);
  return (
    <div
      className={`min-h-screen w-full min-w-0 text-white ${!hasCustomPageBg ? "bg-[color:var(--p44-grey-bg)]" : ""}`}
      style={Object.keys(rootStyle).length > 0 ? rootStyle : undefined}
      data-page-bg={hasCustomPageBg ? "custom" : undefined}
    >
      <div data-frontedit="header">
        <MobileTopBar logoUrl={theme.logoUrl} partnershipBadgeUrl={theme.partnershipBadgeUrl} siteName={theme.siteName} />
      </div>
      <div data-frontedit="marquee">
        <AnnouncementMarquee
          text={theme.announcementMarqueeText ?? (t.marqueedefaulttext ?? "Welcome — Latest promotions and updates")}
          messages={theme.marqueeMessages}
        />
      </div>
      <div data-mobile-shell-content className={contentClass}>{children}</div>
      <AgeGateModal ageGate={theme.ageGate} uiText={t} />
      <DownloadAppBar theme={theme} />
      {!useVividPortal && <LiveChatFab chatUrl={chatUrl} uiText={t} socialLinks={socialLinks ?? []} />}
      {useVividPortal ? <VividBottomNav /> : <MobileBottomNav chatUrl={chatUrl} theme={theme} />}
    </div>
  );
}
