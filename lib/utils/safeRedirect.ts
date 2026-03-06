export function safeRedirectUrl(raw: string | null | undefined): string | null {
  const s = (raw ?? "").trim();
  if (!s) return null;

  // Allow relative internal redirects.
  if (s.startsWith("/")) {
    if (s.startsWith("//")) return null;
    if (/[\\\u0000-\u001f\u007f]/.test(s)) return null;
    return s;
  }

  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (!u.hostname) return null;
    return u.toString();
  } catch {
    return null;
  }
}

