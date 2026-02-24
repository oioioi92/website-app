import { redirect } from "next/navigation";
import { getPublicTheme } from "@/lib/theme/getPublicTheme";
import { safeRedirectUrl } from "@/lib/utils/safeRedirect";
import { RegisterSplitClient } from "@/components/public/RegisterSplitClient";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  try {
    const { theme } = await getPublicTheme();
    const url = safeRedirectUrl(theme.registerUrl);
    if (url) redirect(url);
  } catch {
    // fall through
  }
  return <RegisterSplitClient />;
}

