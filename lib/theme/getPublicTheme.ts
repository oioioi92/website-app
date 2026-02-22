import "server-only";

import { getThemeJsonCached } from "@/lib/theme/themeCache";
import { parseThemeJson } from "@/lib/public/theme";

export async function getPublicTheme() {
  const { themeJson, source, version } = await getThemeJsonCached();
  return {
    theme: parseThemeJson(themeJson ?? null),
    meta: { source, version: typeof version === "number" ? version : undefined }
  };
}

