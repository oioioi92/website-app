import { BonusClient } from "@/components/public/BonusClient";
import { PromoHubDesktop } from "@/components/public/PromoHubDesktop";
import { VividPromoClient } from "@/components/vivid/VividPromoClient";
import { getActiveGamesForUi, getActivePromotionsForUi } from "@/lib/public/public-data";
import { getPublicTheme } from "@/lib/theme/getPublicTheme";
import { getFeatureFlags } from "@/lib/public/featureFlags";

export const dynamic = "force-dynamic";
const MOCK_PROMO_COVERS = ["/assets/providers/promotion.png", "/assets/providers/918kiss.png", "/assets/providers/mega888.png"] as const;

function DbFallback({
  uiText,
  routeBonus,
  promotionPattern,
  promotionFontPreset
}: {
  uiText?: Record<string, string>;
  routeBonus?: string;
  promotionPattern?: "classic" | "image_tiles" | "image_strips";
  promotionFontPreset?: "default" | "compact" | "bold";
}) {
  const mockPromotions = [
    {
      id: "mock-1",
      title: "Welcome Bonus 50%",
      subtitle: "Mock promotion",
      coverUrl: MOCK_PROMO_COVERS[0],
      detailJson: { blocks: [{ type: "p", text: "Mock promotion detail text." }, { type: "button", label: "Contact", url: "/chat" }] },
      ruleJson: {},
      percentText: "50%",
      statusLabel: "ACTIVE" as const,
      limitTag: "Mock Rule",
      grantTag: "Mock Grant",
      groupLabel: "GENERAL"
    },
    {
      id: "mock-2",
      title: "Weekly Cashback",
      subtitle: "Mock promotion",
      coverUrl: MOCK_PROMO_COVERS[1],
      detailJson: { blocks: [{ type: "p", text: "Mock promotion detail text." }, { type: "button", label: "Apply", url: "/chat" }] },
      ruleJson: {},
      percentText: "20%",
      statusLabel: "SCHEDULED" as const,
      limitTag: "Mock Rule",
      grantTag: "Mock Grant",
      groupLabel: "GENERAL"
    }
  ];
  return (
    <BonusClient
      promotions={mockPromotions}
      games={[]}
      uiText={uiText}
      routeBonus={routeBonus}
      promotionPattern={promotionPattern}
      promotionFontPreset={promotionFontPreset}
    />
  );
}

/** /bonus: Vivid Portal defaultTab=Bonus on desktop; BonusClient on mobile. */
export default async function PublicBonusPage() {
  const now = new Date();
  try {
    const [flags, { theme }, promotionsUi, gamesUi] = await Promise.all([
      getFeatureFlags(),
      getPublicTheme(),
      getActivePromotionsForUi(50, now),
      getActiveGamesForUi(24)
    ]);
    return (
      <>
        {flags.useVividPortal ? (
          <VividPromoClient
            promotions={promotionsUi}
            siteName={theme.siteName ?? "KINGDOM888"}
            defaultTab="Bonus"
            loginUrl={theme.loginUrl ?? "/login"}
            registerUrl={theme.registerUrl ?? "/register-wa"}
            cardConfig={theme.vividPromoCardConfig}
            routeBonus={theme.routes.bonus}
            uiText={theme.uiText}
          />
        ) : (
          <>
            <div className="hidden lg:block">
              <PromoHubDesktop
                promotions={promotionsUi}
                defaultTab="Bonus"
                routeBonus={theme.routes.bonus}
                uiText={theme.uiText}
              />
            </div>
            <div className="lg:hidden">
              <BonusClient
                promotions={promotionsUi}
                games={gamesUi}
                uiText={theme.uiText}
                routeBonus={theme.routes.bonus}
                promotionPattern={theme.promotionPattern}
                promotionFontPreset={theme.promotionFontPreset}
              />
            </div>
          </>
        )}
      </>
    );
  } catch {
    try {
      const { theme } = await getPublicTheme();
      const fallback = (
        <DbFallback
          uiText={theme.uiText}
          routeBonus={theme.routes.bonus}
          promotionPattern={theme.promotionPattern}
          promotionFontPreset={theme.promotionFontPreset}
        />
      );
      return (
        <>
          <div className="hidden lg:block">
            <PromoHubDesktop promotions={[]} defaultTab="Bonus" routeBonus={theme.routes.bonus} uiText={theme.uiText} />
          </div>
          <div className="lg:hidden">{fallback}</div>
        </>
      );
    } catch {
      return (
        <>
          <div className="hidden lg:block">
            <PromoHubDesktop promotions={[]} defaultTab="Bonus" routeBonus="/bonus" />
          </div>
          <div className="lg:hidden"><DbFallback /></div>
        </>
      );
    }
  }
}
