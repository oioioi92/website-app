import { redirect } from "next/navigation";
import Link from "next/link";
import { getPublicTheme } from "@/lib/theme/getPublicTheme";
import { safeRedirectUrl } from "@/lib/utils/safeRedirect";

export const dynamic = "force-dynamic";

export default async function WithdrawPage() {
  try {
    const { theme } = await getPublicTheme();
    const url = safeRedirectUrl(theme.withdrawUrl);
    if (url) redirect(url);
  } catch {
    // fall through
  }
  return (
    <main className="mx-auto max-w-md px-4 py-10 text-white">
      <h1 className="text-xl font-extrabold">Withdraw</h1>
      <p className="mt-2 text-sm text-white/70">尚未配置 withdrawUrl。请到后台 Theme Settings 填写 withdrawUrl。</p>
      <Link href="/" className="mt-4 inline-block text-[color:var(--rb-gold2)] underline">Back to Home</Link>
    </main>
  );
}

