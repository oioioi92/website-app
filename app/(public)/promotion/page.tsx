import { BonusClient } from "@/components/public/BonusClient";
import { PromoHubDesktop } from "@/components/public/PromoHubDesktop";
import { VividPromoClient } from "@/components/vivid/VividPromoClient";
import { getActiveGamesForUi, getActivePromotionsForUi } from "@/lib/public/public-data";
import { getPublicTheme } from "@/lib/theme/getPublicTheme";
import { getFeatureFlags } from "@/lib/public/featureFlags";

export const dynamic = "force-dynamic";

/** /promotion (DESKTOP-UI-DESIGN-SPEC §6): PromoHub defaultTab=Promotion on desktop; BonusClient on mobile. */
export default async function PromotionPage() {
  const now = new Date();
  let promotions: Awaited<ReturnType<typeof getActivePromotionsForUi>> = [];
  let games: Awaited<ReturnType<typeof getActiveGamesForUi>> = [];
  let theme: Awaited<ReturnType<typeof getPublicTheme>>["theme"] | null = null;
  try {
    const [t, p, g] = await Promise.all([
      getPublicTheme(),
      getActivePromotionsForUi(50, now),
      getActiveGamesForUi(24)
    ]);
    theme = t.theme;
    promotions = p;
    games = g;
  } catch {
    try {
      const t = await getPublicTheme();
      theme = t.theme;
    } catch {
      theme = null;
    }
  }
  const routeBonus = theme?.routes?.bonus ?? "/bonus";
  const uiText = theme?.uiText ?? {};
  let useVivid = false;
  try { useVivid = (await getFeatureFlags()).useVividPortal; } catch { /* ignore */ }
  return (
    <>
      {useVivid ? (
        <VividPromoClient
          promotions={promotions}
          siteName={theme?.siteName ?? "KINGDOM888"}
          defaultTab="Promotion"
          loginUrl={theme?.loginUrl ?? "/login"}
          registerUrl={theme?.registerUrl ?? "/register-wa"}
          cardConfig={theme?.vividPromoCardConfig}
          routeBonus={routeBonus}
          uiText={uiText}
        />
      ) : (
        <>
          <div className="hidden lg:block">
            <PromoHubDesktop promotions={promotions} defaultTab="Promotion" routeBonus={routeBonus} uiText={uiText} />
          </div>
          <div className="lg:hidden">
            <BonusClient
              promotions={promotions}
              games={games}
              uiText={uiText}
              routeBonus={routeBonus}
              promotionPattern={theme?.promotionPattern ?? "classic"}
              promotionFontPreset={theme?.promotionFontPreset ?? "default"}
            />
          </div>
        </>
      )}
    </>
  );
}
