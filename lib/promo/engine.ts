import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export type PromoRule = {
  version?: number;
  limits?: { perDay?: number | null; perWeek?: number | null; perLifetime?: number | null };
  eligible?: { minDeposit?: number | null; channels?: string[] | null; providers?: string[] | null };
  grant?: { mode?: "PERCENT" | "FIXED"; percent?: number | null; fixedAmount?: number | null; capAmount?: number | null };
};

export type NormalizedPromoRule = {
  version: 1;
  limits: { perDay?: number; perWeek?: number; perLifetime?: number };
  eligible: { minDeposit?: number; channels?: string[]; providers?: string[] };
  grant: { mode: "PERCENT" | "FIXED"; percent?: number; fixedAmount?: number; capAmount?: number };
};

export function normalizeRule(ruleJson: Prisma.JsonValue | null | undefined): NormalizedPromoRule {
  const raw = (ruleJson ?? {}) as PromoRule;
  const normalized: NormalizedPromoRule = {
    version: 1,
    limits: {},
    eligible: {},
    grant: {
      mode: raw.grant?.mode === "FIXED" ? "FIXED" : "PERCENT"
    }
  };

  const perDay = Number(raw.limits?.perDay);
  const perWeek = Number(raw.limits?.perWeek);
  const perLifetime = Number(raw.limits?.perLifetime);
  if (Number.isFinite(perDay) && perDay >= 0) normalized.limits.perDay = perDay;
  if (Number.isFinite(perWeek) && perWeek >= 0) normalized.limits.perWeek = perWeek;
  if (Number.isFinite(perLifetime) && perLifetime >= 0) normalized.limits.perLifetime = perLifetime;

  const minDeposit = Number(raw.eligible?.minDeposit);
  if (Number.isFinite(minDeposit) && minDeposit >= 0) normalized.eligible.minDeposit = minDeposit;
  if (Array.isArray(raw.eligible?.channels) && raw.eligible!.channels!.length > 0) {
    normalized.eligible.channels = raw.eligible!.channels!.filter(Boolean);
  }
  if (Array.isArray(raw.eligible?.providers) && raw.eligible!.providers!.length > 0) {
    normalized.eligible.providers = raw.eligible!.providers!.filter(Boolean);
  }

  const percent = Number(raw.grant?.percent);
  const fixedAmount = Number(raw.grant?.fixedAmount);
  const capAmount = Number(raw.grant?.capAmount);
  if (Number.isFinite(percent) && percent >= 0) normalized.grant.percent = percent;
  if (Number.isFinite(fixedAmount) && fixedAmount >= 0) normalized.grant.fixedAmount = fixedAmount;
  if (Number.isFinite(capAmount) && capAmount >= 0) normalized.grant.capAmount = capAmount;

  return normalized;
}

export function validatePromotionActive(promo: {
  isActive: boolean;
  isClaimable: boolean;
  startAt: Date | null;
  endAt: Date | null;
}, now: Date) {
  if (!promo.isActive || !promo.isClaimable) return { ok: false, reason: "PROMO_INACTIVE" };
  if (promo.startAt && now < promo.startAt) return { ok: false, reason: "PROMO_NOT_STARTED" };
  if (promo.endAt && now > promo.endAt) return { ok: false, reason: "PROMO_EXPIRED" };
  return { ok: true as const };
}

function dayRange(now: Date) {
  const s = new Date(now);
  s.setHours(0, 0, 0, 0);
  const e = new Date(s);
  e.setDate(e.getDate() + 1);
  return { s, e };
}

function weekRange(now: Date) {
  const s = new Date(now);
  s.setHours(0, 0, 0, 0);
  const day = s.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  s.setDate(s.getDate() + mondayOffset);
  const e = new Date(s);
  e.setDate(e.getDate() + 7);
  return { s, e };
}

export async function canClaim(
  promo: { id: string; ruleJson: Prisma.JsonValue; isActive: boolean; isClaimable: boolean; startAt: Date | null; endAt: Date | null },
  memberId: string,
  now: Date
) {
  const active = validatePromotionActive(promo, now);
  if (!active.ok) return { ok: false as const, reason: active.reason, nextEligibleAt: null };

  const rule = normalizeRule(promo.ruleJson);
  const limits = rule.limits ?? {};

  const [perDayCount, perWeekCount, lifetimeCount] = await Promise.all([
    limits.perDay
      ? db.promotionClaim.count({
          where: {
            promotionId: promo.id,
            memberId,
            status: "APPROVED",
            claimedAt: { gte: dayRange(now).s, lt: dayRange(now).e }
          }
        })
      : Promise.resolve(0),
    limits.perWeek
      ? db.promotionClaim.count({
          where: {
            promotionId: promo.id,
            memberId,
            status: "APPROVED",
            claimedAt: { gte: weekRange(now).s, lt: weekRange(now).e }
          }
        })
      : Promise.resolve(0),
    limits.perLifetime
      ? db.promotionClaim.count({
          where: { promotionId: promo.id, memberId, status: "APPROVED" }
        })
      : Promise.resolve(0)
  ]);

  if (limits.perDay && perDayCount >= limits.perDay) {
    return { ok: false as const, reason: "LIMIT_PER_DAY_REACHED", nextEligibleAt: dayRange(now).e };
  }
  if (limits.perWeek && perWeekCount >= limits.perWeek) {
    return { ok: false as const, reason: "LIMIT_PER_WEEK_REACHED", nextEligibleAt: weekRange(now).e };
  }
  if (limits.perLifetime && lifetimeCount >= limits.perLifetime) {
    return { ok: false as const, reason: "LIMIT_PER_LIFETIME_REACHED", nextEligibleAt: null };
  }

  return { ok: true as const, reason: "OK", nextEligibleAt: null };
}

export function calculateGrant(
  promo: { percent: Prisma.Decimal | number | string; ruleJson: Prisma.JsonValue },
  baseAmount: number
) {
  const base = new Prisma.Decimal(baseAmount);
  const rule = normalizeRule(promo.ruleJson);
  const grant = rule.grant ?? {};
  const mode = grant.mode ?? "PERCENT";

  let amount = new Prisma.Decimal(0);
  if (mode === "FIXED") {
    amount = new Prisma.Decimal(grant.fixedAmount ?? 0);
  } else {
    const p = grant.percent ?? Number(promo.percent ?? 0);
    amount = base.mul(new Prisma.Decimal(p)).div(100);
  }
  if (grant.capAmount !== undefined && grant.capAmount !== null) {
    const cap = new Prisma.Decimal(grant.capAmount);
    if (amount.gt(cap)) amount = cap;
  }
  return amount;
}

export async function recordClaim(input: {
  promotionId: string;
  memberId: string;
  status: "APPROVED" | "REJECTED" | "REVERSED";
  amountGranted?: Prisma.Decimal | null;
  metaJson?: Prisma.JsonValue;
  createdByAdminId?: string | null;
}) {
  const normalizedMeta =
    input.metaJson === undefined || input.metaJson === null
      ? Prisma.JsonNull
      : (JSON.parse(JSON.stringify(input.metaJson)) as Prisma.InputJsonValue);
  return db.promotionClaim.create({
    data: {
      promotionId: input.promotionId,
      memberId: input.memberId,
      status: input.status,
      amountGranted: input.amountGranted ?? null,
      metaJson: normalizedMeta,
      createdByAdminId: input.createdByAdminId ?? null
    }
  });
}
