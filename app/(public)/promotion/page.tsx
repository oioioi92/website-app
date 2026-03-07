import { VividPromoClient } from "@/components/vivid/VividPromoClient";
import { getActivePromotionsForUi } from "@/lib/public/public-data";
import { getPublicTheme } from "@/lib/theme/getPublicTheme";

export const dynamic = "force-dynamic";

export default async function PromotionPage() {
  const now = new Date();
  let promotions: Awaited<ReturnType<typeof getActivePromotionsForUi>> = [];
  let theme: Awaited<ReturnType<typeof getPublicTheme>>["theme"] | null = null;
  try {
    const [t, p] = await Promise.all([
      getPublicTheme(),
      getActivePromotionsForUi(50, now),
    ]);
    theme = t.theme;
    promotions = p;
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
  return (
    <VividPromoClient
      promotions={promotions}
      siteName={theme?.siteName ?? "KINGDOM888"}
      logoUrl={theme?.logoUrl ?? null}
      defaultTab="Promotion"
      loginUrl={theme?.loginUrl ?? "/login"}
      registerUrl={theme?.registerUrl ?? "/register-wa"}
      cardConfig={theme?.vividPromoCardConfig}
      routeBonus={routeBonus}
      uiText={uiText}
    />
  );
}
