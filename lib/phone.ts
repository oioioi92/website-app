/**
 * 手机号规范化与 E.164 校验（用于会员登录/注册）
 */
export function normalizePhone(input: string): string {
  const s = input.trim().replace(/[\s\-\(\)]/g, "");
  if (!s) return "";
  if (s.startsWith("+")) return s;
  if (/^0\d+/.test(s)) return "+6" + s;
  if (/^\d{10,15}$/.test(s)) return "+" + s;
  return s;
}

export function isE164(phone: string): boolean {
  return /^\+[1-9]\d{9,14}$/.test(phone);
}
