/**
 * 手机号/用户引用只显示尾 4 位，前面用 * 替代。
 * 支持带符号/空格：先提取数字再取尾 4；空则返回 "****"。
 * 不足 4 位时按实际显示（仍尽可能 mask，如 "123" -> "***123"）。
 */
export function maskPhoneTail4(ref: string | null | undefined): string {
  const raw = String(ref ?? "").trim().replace(/\D/g, "");
  if (raw.length === 0) return "****";
  if (raw.length < 4) return "***" + raw; /* 不足 4 位：*** + 数字，如 ***123 */
  return "*******" + raw.slice(-4); /* 4 位及以上：只露尾 4 */
}
