import { db } from "@/lib/db";
import { VividHomeClient } from "@/components/vivid/VividHomeClient";
import { VividMobileHome } from "@/components/vivid/VividMobileHome";
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
    const [{ theme }, promotionsUi, gamesUi] = await Promise.all([
      getPublicTheme(),
      getActivePromotionsForUi(12, now),
      getActiveGamesForUi(120)
    ]);

    return (
      <>
        <div className="hidden lg:block">
          <VividHomeClient
            siteName={theme.siteName ?? "KINGDOM888"}
            logoUrl={theme.logoUrl ?? null}
            promotions={promotionsUi}
            games={gamesUi}
            loginUrl={theme.loginUrl ?? "/login"}
            registerUrl={theme.registerUrl ?? "/register-wa"}
            depositUrl={theme.depositUrl ?? "/deposit"}
            internalTestMode={internalTestMode}
            uiText={theme.uiText ?? {}}
            heroBanners={theme.heroBanners ?? []}
            announcementMarqueeText={theme.announcementMarqueeText ?? null}
            marqueeMessages={theme.marqueeMessages ?? []}
            marqueeBg={theme.marqueeBg ?? null}
            marqueeBorder={theme.marqueeBorder ?? null}
            marqueeTextColor={theme.marqueeTextColor ?? null}
            livetxDepositColor={theme.livetxDepositColor ?? null}
            livetxWithdrawColor={theme.livetxWithdrawColor ?? null}
            referralBlockBg={theme.referralBlockBg ?? null}
            referralBlockBorder={theme.referralBlockBorder ?? null}
            referralBannerImageUrl={theme.referralBannerImageUrl ?? null}
            quickActions={theme.quickActions ?? []}
            uiGameCategories={theme.uiGameCategories ?? []}
          />
        </div>
        <div className="lg:hidden">
          <VividMobileHome theme={theme} promotions={promotionsUi} games={gamesUi} internalTestMode={internalTestMode} />
        </div>
      </>
    );
  } catch {
    const mockTheme = parseThemeJson(null);
    const mockPromotions = [
      {
        id: "mock-1",
        title: "Welcome Bonus 50%",
        subtitle: null,
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
        subtitle: null,
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
        subtitle: null,
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

    return (
      <>
        <div className="hidden lg:block">
          <VividHomeClient
            siteName={mockTheme.siteName ?? "Site"}
            logoUrl={mockTheme.logoUrl ?? null}
            promotions={mockPromotions}
            games={mockGames}
            loginUrl={mockTheme.loginUrl ?? "/login"}
            registerUrl={mockTheme.registerUrl ?? "/register-wa"}
            depositUrl={mockTheme.depositUrl ?? "/deposit"}
            internalTestMode={internalTestMode}
            uiText={mockTheme.uiText ?? {}}
            heroBanners={mockTheme.heroBanners ?? []}
            announcementMarqueeText={mockTheme.announcementMarqueeText ?? null}
            marqueeMessages={mockTheme.marqueeMessages ?? []}
            marqueeBg={mockTheme.marqueeBg ?? null}
            marqueeBorder={mockTheme.marqueeBorder ?? null}
            marqueeTextColor={mockTheme.marqueeTextColor ?? null}
            livetxDepositColor={mockTheme.livetxDepositColor ?? null}
            livetxWithdrawColor={mockTheme.livetxWithdrawColor ?? null}
            referralBlockBg={mockTheme.referralBlockBg ?? null}
            referralBlockBorder={mockTheme.referralBlockBorder ?? null}
            referralBannerImageUrl={mockTheme.referralBannerImageUrl ?? null}
            quickActions={mockTheme.quickActions ?? []}
            uiGameCategories={mockTheme.uiGameCategories ?? []}
          />
        </div>
        <div className="lg:hidden">
          <VividMobileHome theme={mockTheme} promotions={mockPromotions} games={mockGames} internalTestMode={internalTestMode} />
        </div>
      </>
    );
  }
}
