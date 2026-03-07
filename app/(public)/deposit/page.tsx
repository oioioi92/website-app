import { redirect } from "next/navigation";
import { getPublicTheme } from "@/lib/theme/getPublicTheme";
import { safeRedirectUrl } from "@/lib/utils/safeRedirect";
import { VividDepositPage } from "@/components/vivid/VividDepositPage";

export const dynamic = "force-dynamic";

export default async function DepositPage() {
  let depositUrl: string | null = null;
  let siteName = "KINGDOM888";
  let logoUrl: string | null = null;
  let loginUrl = "/login";
  let registerUrl = "/register-wa";
  let whatsappUrl: string | null = null;

  try {
    const { theme } = await getPublicTheme();
    siteName = theme.siteName ?? siteName;
    logoUrl = theme.logoUrl ?? null;
    loginUrl = theme.loginUrl ?? loginUrl;
    registerUrl = theme.registerUrl ?? registerUrl;

    const url = safeRedirectUrl(theme.depositUrl);
    if (url) redirect(url);
    depositUrl = theme.depositUrl ?? null;

    const wa = (theme.socialLinks ?? []).find((s) => s.type === "whatsapp");
    whatsappUrl = wa?.url ?? null;
  } catch {
    // fall through — show Vivid fallback
  }

  return (
    <VividDepositPage
      siteName={siteName}
      logoUrl={logoUrl}
      loginUrl={loginUrl}
      registerUrl={registerUrl}
      depositUrl={depositUrl}
      whatsappUrl={whatsappUrl}
    />
  );
}

