import { redirect } from "next/navigation";
import { getPublicTheme } from "@/lib/theme/getPublicTheme";
import { safeRedirectUrl } from "@/lib/utils/safeRedirect";
import { LoginSplitClient } from "@/components/public/LoginSplitClient";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  try {
    const { theme } = await getPublicTheme();
    const url = safeRedirectUrl(theme.loginUrl);
    if (url) redirect(url);
  } catch {
    // fall through
  }
  return <LoginSplitClient />;
}

