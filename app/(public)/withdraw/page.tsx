import { redirect } from "next/navigation";
import { getPublicTheme } from "@/lib/theme/getPublicTheme";
import { safeRedirectUrl } from "@/lib/utils/safeRedirect";
import { VividWithdrawPage } from "@/components/vivid/VividWithdrawPage";

export const dynamic = "force-dynamic";

export default async function WithdrawPage() {
  let withdrawUrl: string | null = null;
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

    const url = safeRedirectUrl(theme.withdrawUrl);
    if (url) redirect(url);
    withdrawUrl = theme.withdrawUrl ?? null;

    const wa = (theme.socialLinks ?? []).find((s) => s.type === "whatsapp");
    whatsappUrl = wa?.url ?? null;
  } catch {
    // fall through — show Vivid fallback
  }

  return (
    <VividWithdrawPage
      siteName={siteName}
      logoUrl={logoUrl}
      loginUrl={loginUrl}
      registerUrl={registerUrl}
      withdrawUrl={withdrawUrl}
      whatsappUrl={whatsappUrl}
    />
  );
}

