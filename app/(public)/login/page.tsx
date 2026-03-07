import { redirect } from "next/navigation";
import { getPublicTheme } from "@/lib/theme/getPublicTheme";
import { safeRedirectUrl } from "@/lib/utils/safeRedirect";
import { LoginSplitClient } from "@/components/public/LoginSplitClient";
import { VividLoginClient } from "@/components/vivid/VividLoginClient";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  let siteName = "KINGDOM888";
  let logoUrl: string | null = null;
  let registerUrl = "/register-wa";
  try {
    const { theme } = await getPublicTheme();
    const url = safeRedirectUrl(theme.loginUrl);
    if (url) redirect(url);
    siteName = theme.siteName ?? "KINGDOM888";
    logoUrl = theme.logoUrl ?? null;
    registerUrl = theme.registerUrl ?? "/register-wa";
  } catch {
    // fall through
  }

  return (
    <>
      <div className="hidden lg:block">
        <VividLoginClient siteName={siteName} logoUrl={logoUrl} loginUrl="/login" registerUrl={registerUrl} />
      </div>
      <div className="lg:hidden">
        <LoginSplitClient />
      </div>
    </>
  );
}

