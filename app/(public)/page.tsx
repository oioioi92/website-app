import { db } from "@/lib/db";
import { HomeClient } from "@/components/HomeClient";
import { HomeCoverClient } from "@/components/home/HomeCoverClient";
import { MobileHomeV2 } from "@/components/home/mobile/MobileHomeV2";
import { MobileHomeV3 } from "@/components/home/mobile/MobileHomeV3";
import { parseThemeJson } from "@/lib/public/theme";
import { getActiveGamesForUi, getActivePromotionsForUi } from "@/lib/public/public-data";
import { getProviderLogoFallback } from "@/lib/public/namedAssets";
import { getPublicTheme } from "@/lib/theme/getPublicTheme";
import { getFeatureFlags } from "@/lib/public/featureFlags";

export const dynamic = "force-dynamic";

const MOCK_PROMO_COVERS = ["/assets/providers/promotion.png", "/assets/providers/918kiss.png", "/assets/providers/mega888.png"] as const;

export default async function PublicHomePage() {
  const flags = await getFeatureFlags();
  const internalTestMode = flags.internalTestMode;
  const now = new Date();
  try {
    const [{ theme }, promotionsUi, gamesUi, social] = await Promise.all([
      getPublicTheme(),
      getActivePromotionsForUi(12, now),
      // Mobile wants "all games" at bottom; pull more and let UI chunk it.
      getActiveGamesForUi(120),
      db.socialLink.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
        select: { id: true, label: true, url: true, iconUrl: true },
        take: 5
      })
    ]);

    const showNewHome = true;
    // 默认开启 V3（避免线上忘记配 env 导致“怎么部署都没变化”）
    const useHomeV3 = flags.useHomeV3;

    if (showNewHome) {
      return (
        <>
          <HomeCoverClient
            logoUrl={theme.logoUrl}
            siteName={theme.siteName}
            legalLinks={theme.legalLinks}
            uiText={theme.uiText}
            routes={theme.routes}
            announcementMarqueeText={theme.announcementMarqueeText}
            marqueeMessages={theme.marqueeMessages}
            centerSlotImageUrl={theme.centerSlotImageUrl}
            loginUrl={theme.loginUrl}
            registerUrl={theme.registerUrl}
            depositUrl={theme.depositUrl}
            withdrawUrl={theme.withdrawUrl}
            actionBarDepositColor={theme.actionBarDepositColor}
            actionBarWithdrawColor={theme.actionBarWithdrawColor}
            actionBarButtonImages={theme.actionBarButtonImages}
            actionBarLimits={theme.actionBarLimits}
            liveTxBgImageUrl={theme.liveTxBgImageUrl}
            promotions={promotionsUi}
            games={gamesUi}
            social={social}
            partnershipBadgeUrl={theme.partnershipBadgeUrl}
            internalTestMode={internalTestMode}
            useV3Layout={useHomeV3}
          />
          <div className="lg:hidden">
            {useHomeV3 ? (
              <MobileHomeV3 theme={theme} promotions={promotionsUi} games={gamesUi} internalTestMode={internalTestMode} />
            ) : (
              <MobileHomeV2 theme={theme} promotions={promotionsUi} games={gamesUi} internalTestMode={internalTestMode} />
            )}
          </div>
        </>
      );
    }

    return <HomeClient promotions={promotionsUi} games={gamesUi} social={social} internalTestMode={internalTestMode} theme={theme} />;
  } catch {
    if (!flags.useLegacyHome) {
      // 占位数据：无后台活动时前台展示用，正式环境请配置后台活动
      const mockPromotions = [
        {
          id: "mock-1",
          title: "Welcome Bonus 50%",
          subtitle: "Desktop mock",
          coverUrl: MOCK_PROMO_COVERS[0],
          detailJson: { blocks: [{ type: "p", text: "Mock detail content." }] },
          ruleJson: {},
          percentText: "50%",
          statusLabel: "ACTIVE" as const,
          limitTag: "Mock Rule",
          grantTag: "Mock Grant",
          groupLabel: "GENERAL"
        },
        {
          id: "mock-2",
          title: "New Member Gift",
          subtitle: "Desktop mock",
          coverUrl: MOCK_PROMO_COVERS[1],
          detailJson: { blocks: [{ type: "p", text: "Mock detail content." }] },
          ruleJson: {},
          percentText: "30%",
          statusLabel: "ACTIVE" as const,
          limitTag: "Mock Rule",
          grantTag: "Mock Grant",
          groupLabel: "GENERAL"
        },
        {
          id: "mock-3",
          title: "Weekly Cashback",
          subtitle: "Desktop mock",
          coverUrl: MOCK_PROMO_COVERS[2],
          detailJson: { blocks: [{ type: "p", text: "Mock detail content." }] },
          ruleJson: {},
          percentText: "20%",
          statusLabel: "SCHEDULED" as const,
          limitTag: "Mock Rule",
          grantTag: "Mock Grant",
          groupLabel: "GENERAL"
        }
      ];
      const mockGames = Array.from({ length: 18 }).map((_, idx) => ({
        id: `mock-game-${idx + 1}`,
        name: `Provider ${idx + 1}`,
        logoUrl: getProviderLogoFallback(idx),
        code: `P${idx + 1}`
      }));
      const mockTheme = parseThemeJson(null);
      return (
        <>
          <HomeCoverClient
            logoUrl={null}
            siteName="Site"
            announcementMarqueeText={mockTheme.announcementMarqueeText}
            routes={mockTheme.routes}
            promotions={mockPromotions}
            games={mockGames}
            social={[]}
            internalTestMode={internalTestMode}
          />
          <div className="lg:hidden">
            <MobileHomeV2 theme={mockTheme} promotions={mockPromotions} games={mockGames} internalTestMode={internalTestMode} />
          </div>
        </>
      );
    }

    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <p className="text-lg font-semibold text-white">数据库未连接</p>
        <p className="mt-2 text-sm text-white/70">
          请在项目根目录的 <code className="rounded bg-white/10 px-1">.env</code> 中配置{" "}
          <code className="rounded bg-white/10 px-1">DATABASE_URL</code>，格式示例：
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg border border-white/20 bg-black/30 p-3 text-left text-xs text-[color:var(--rb-gold2)]">
          DATABASE_URL=&quot;postgresql://用户:密码@localhost:5432/数据库名&quot;
        </pre>
        <p className="mt-3 text-xs text-white/50">配置后重启 dev 服务器（npm run dev）</p>
      </div>
    );
  }
}
