import type { z } from "zod";
import { themeSchema, type CanonicalTheme } from "@/lib/theme/themeSchema";

export type ThemeNormalizeErrorCode =
  | "THEME_SCHEMA_INVALID"
  | "THEME_INVALID_URL";

export type ThemeNormalizeResult =
  | { ok: true; theme: CanonicalTheme }
  | { ok: false; error: ThemeNormalizeErrorCode; issues: Array<{ path: string; message: string }> };

function issuePath(issue: z.ZodIssue) {
  const p = issue.path && issue.path.length ? issue.path.map(String).join(".") : "$";
  return p;
}

function mapErrorToCode(issues: z.ZodIssue[]): ThemeNormalizeErrorCode {
  // If any URL-related failures exist, classify as INVALID_URL.
  if (issues.some((i) => i.message.includes("INVALID_URL") || i.message.includes("URL_REQUIRED") || i.message.includes("SVG_FORBIDDEN"))) {
    return "THEME_INVALID_URL";
  }
  return "THEME_SCHEMA_INVALID";
}

export function normalizeThemeForWrite(input: unknown): ThemeNormalizeResult {
  const parsed = themeSchema.safeParse(input);
  if (!parsed.success) {
    const issues = parsed.error.issues.slice(0, 20).map((i) => ({
      path: issuePath(i),
      message: i.message
    }));
    return { ok: false, error: mapErrorToCode(parsed.error.issues), issues };
  }

  // Canonicalize empty arrays that are not set: keep defaults from schema.
  // Ensure JSON-safe (drops undefined).
  const canonical = JSON.parse(JSON.stringify(parsed.data)) as CanonicalTheme;
  return { ok: true, theme: canonical };
}

