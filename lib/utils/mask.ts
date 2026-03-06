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

/**
 * 马来西亚手机号遮蔽：10 或 11 位数只显示前 3 位 + ***** + 后 3 位（中间竖线 | 在展示时与金额一起，不在此函数内）。
 * 例如 0123456789 -> 012*****789，01234567890 -> 012*****890。
 */
export function maskPhoneHead3Tail3(ref: string | null | undefined): string {
  const raw = String(ref ?? "").trim().replace(/\D/g, "");
  if (raw.length === 0) return "****";
  if (raw.length < 6) return maskPhoneTail4(ref); /* 不足 6 位用尾 4 位遮蔽 */
  return raw.slice(0, 3) + "*****" + raw.slice(-3);
}

/**
 * 电话号码显示前 2 位 + ******* + 后 3 位，如 60123456789 -> 60*******789。
 */
export function maskPhoneHead2Tail3(ref: string | null | undefined): string {
  const raw = String(ref ?? "").trim().replace(/\D/g, "");
  if (raw.length >= 5) return raw.slice(0, 2) + "*******" + raw.slice(-3);
  // 原始值过短（如 001/1234）时，也统一输出同一视觉格式，避免出现 ***001
  const tail3 = raw.length > 0 ? raw.slice(-3).padStart(3, "0") : "000";
  return "60" + "*******" + tail3;
}
