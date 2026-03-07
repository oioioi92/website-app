import type { ReactNode } from "react";
import { AnnouncementMarquee } from "@/components/public/AnnouncementMarquee";
import { AgeGateModal } from "@/components/public/AgeGateModal";
import { DownloadAppBar } from "@/components/public/DownloadAppBar";
import { LiveChatFab } from "@/components/public/LiveChatFab";
import { MobileTopBar } from "@/components/public/MobileTopBar";
import { UnifiedBottomNav } from "@/components/public/UnifiedBottomNav";
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
  const bgStyle: React.CSSProperties = {};
  if (theme.pageBackgroundColor) bgStyle.backgroundColor = theme.pageBackgroundColor;
  if (theme.pageBackgroundUrl) {
    bgStyle.backgroundImage = `url(${theme.pageBackgroundUrl})`;
    bgStyle.backgroundSize = "cover";
    bgStyle.backgroundPosition = "center";
    bgStyle.backgroundAttachment = "fixed";
  }
  const designStyle = theme.designStyle && ["minimal", "luxury", "gaming", "soft", "default"].includes(theme.designStyle) ? theme.designStyle : undefined;
  const wrapperClass = ["min-h-screen", "w-full", "min-w-0", "text-white", designStyle ? `design-style-${designStyle}` : ""].filter(Boolean).join(" ");
  return (
    <div
      className={wrapperClass}
      {...(designStyle ? { "data-design-style": designStyle } : {})}
      style={Object.keys(bgStyle).length > 0 ? { ...bgStyle } : { backgroundColor: "var(--p44-grey-bg)" }}
    >
      <div data-frontedit="header">
        <MobileTopBar logoUrl={theme.logoUrl} partnershipBadgeUrl={theme.partnershipBadgeUrl} siteName={theme.siteName} />
      </div>
      <div data-frontedit="marquee">
        <AnnouncementMarquee
          text={theme.announcementMarqueeText ?? (t.marqueedefaulttext ?? "Welcome — Latest promotions and updates")}
          messages={theme.marqueeMessages}
          variant="vivid"
          marqueeBg={theme.marqueeBg}
          marqueeBorder={theme.marqueeBorder}
          textColor={theme.marqueeTextColor}
        />
      </div>
      <div data-mobile-shell-content className={contentClass}>{children}</div>
      <AgeGateModal ageGate={theme.ageGate} uiText={t} />
      <DownloadAppBar theme={theme} />
      {!useVividPortal && <LiveChatFab chatUrl={chatUrl} uiText={t} socialLinks={socialLinks ?? []} fabBg={theme.chatFabBg} />}
      <UnifiedBottomNav theme={theme} variant={useVividPortal ? "vivid" : "default"} />
    </div>
  );
}
