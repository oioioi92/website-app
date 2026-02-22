import { rateLimit } from "@/lib/rate-limit";

export function checkPromoPublicRateLimit(input: {
  ip: string;
  memberRef: string;
  promotionId: string;
}) {
  const byPromoMember = rateLimit(
    `promo-public:member:${input.memberRef}:promo:${input.promotionId}:1m`,
    10,
    60 * 1000
  );
  if (!byPromoMember.ok) return { ok: false as const, reason: "RATE_LIMITED" };

  const byIp = rateLimit(`promo-public:ip:${input.ip}:1m`, 60, 60 * 1000);
  if (!byIp.ok) return { ok: false as const, reason: "RATE_LIMITED" };

  const byMember = rateLimit(`promo-public:member:${input.memberRef}:1h`, 120, 60 * 60 * 1000);
  if (!byMember.ok) return { ok: false as const, reason: "RATE_LIMITED" };

  return { ok: true as const };
}
