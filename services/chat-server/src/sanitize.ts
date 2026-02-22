/**
 * P0 input safety:
 * - Store only plain text (no HTML)
 * - Strip control chars
 * - Hard cap length to prevent abuse
 */
export function sanitizePlainText(input: unknown, maxLen: number) {
  const raw = typeof input === "string" ? input : "";
  const normalized = raw
    .replace(/\r\n/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
  return normalized.length > maxLen ? normalized.slice(0, maxLen) : normalized;
}

