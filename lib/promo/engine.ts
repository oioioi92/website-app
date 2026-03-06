import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

/** Claim Reset：该优惠的领取次数多久重置一次 */
export type ClaimResetPeriod = "NONE" | "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY";

export type PromoRule = {
  version?: number;
  limits?: { perDay?: number | null; perWeek?: number | null; perLifetime?: number | null; perHour?: number | null; perMonth?: number | null };
  /** 领取次数重置周期（与 limits 对应：NONE=perLifetime, DAILY=perDay, WEEKLY=perWeek, MONTHLY=perMonth, HOURLY=perHour） */
  claimReset?: ClaimResetPeriod | null;
  eligible?: { minDeposit?: number | null; channels?: string[] | null; providers?: string[] | null };
  grant?: { mode?: "PERCENT" | "FIXED" | "RANDOM"; percent?: number | null; fixedAmount?: number | null; capAmount?: number | null; randMin?: number | null; randMax?: number | null };
  /**
   * Turnover（流水倍数），与 rollover 为不同设定。
   * 公式：(Deposit + Bonus) × turnover = 游戏里必须有的金额才能洗。
   * 例：Deposit RM10 + Bonus RM5，turnover=3 → 游戏里必须有 45 块才能洗。
   */
  turnover?: number | null;
  /**
   * Rollover（滚存），与 turnover 为不同设定。是否允许 Rollover。
   * true/"allowed" = 允许；false/"not_allowed" = 不允许。
   */
  rollover?: boolean | string | null;
  /** Rollover 倍数（当 rollover 允许时）：(Deposit + Bonus) × rolloverMultiplier = 须完成的投注额等 */
  rolloverMultiplier?: number | null;
  /** 仅限游戏（展示用，如 "JILI | ACEWIN | 【ONLY SLOT】"）*/
  onlyPayGame?: string | null;
  /** 不可用于（展示用，如 "BUY / SAVE FREE GAME"）*/
  notAllowedTo?: string | null;
  /** 禁播游戏链接（展示用）*/
  bannedGameLink?: string | null;
  /** 条款警告文案（如 "VIOLATION OF TERMS WILL FORFEIT ALL POINTS"）*/
  warningText?: string | null;
  /** 展示：字体、详情类型、自定义 class；terms 为两栏表格条款样式 */
  display?: {
    detailType?: "blocks" | "html" | "terms" | null;
    fontFamily?: string | null;
    customClass?: string | null;
  } | null;
  meta?: { category?: string | null; groupLabel?: string | null } | null;
  groupLabel?: string | null;
};

export type NormalizedPromoRule = {
  version: 1;
  limits: { perDay?: number; perWeek?: number; perLifetime?: number; perHour?: number; perMonth?: number };
  eligible: { minDeposit?: number; channels?: string[]; providers?: string[] };
  grant: { mode: "PERCENT" | "FIXED" | "RANDOM"; percent?: number; fixedAmount?: number; capAmount?: number; randMin?: number; randMax?: number };
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
  const perHour = Number(raw.limits?.perHour);
  const perMonth = Number(raw.limits?.perMonth);
  if (Number.isFinite(perDay) && perDay >= 0) normalized.limits.perDay = perDay;
  if (Number.isFinite(perWeek) && perWeek >= 0) normalized.limits.perWeek = perWeek;
  if (Number.isFinite(perLifetime) && perLifetime >= 0) normalized.limits.perLifetime = perLifetime;
  if (Number.isFinite(perHour) && perHour >= 0) normalized.limits.perHour = perHour;
  if (Number.isFinite(perMonth) && perMonth >= 0) normalized.limits.perMonth = perMonth;

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
  const randMin = Number(raw.grant?.randMin);
  const randMax = Number(raw.grant?.randMax);
  if (Number.isFinite(percent) && percent >= 0) normalized.grant.percent = percent;
  if (Number.isFinite(fixedAmount) && fixedAmount >= 0) normalized.grant.fixedAmount = fixedAmount;
  if (Number.isFinite(capAmount) && capAmount >= 0) normalized.grant.capAmount = capAmount;
  if (Number.isFinite(randMin) && randMin >= 0) normalized.grant.randMin = randMin;
  if (Number.isFinite(randMax) && randMax >= 0) normalized.grant.randMax = randMax;

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

function hourRange(now: Date) {
  const s = new Date(now);
  s.setMinutes(0, 0, 0);
  const e = new Date(s);
  e.setHours(e.getHours() + 1);
  return { s, e };
}

function monthRange(now: Date) {
  const s = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const e = new Date(s);
  e.setMonth(e.getMonth() + 1);
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

  const [perHourCount, perDayCount, perWeekCount, perMonthCount, lifetimeCount] = await Promise.all([
    limits.perHour
      ? db.promotionClaim.count({
          where: {
            promotionId: promo.id,
            memberId,
            status: "APPROVED",
            claimedAt: { gte: hourRange(now).s, lt: hourRange(now).e }
          }
        })
      : Promise.resolve(0),
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
    limits.perMonth
      ? db.promotionClaim.count({
          where: {
            promotionId: promo.id,
            memberId,
            status: "APPROVED",
            claimedAt: { gte: monthRange(now).s, lt: monthRange(now).e }
          }
        })
      : Promise.resolve(0),
    limits.perLifetime
      ? db.promotionClaim.count({
          where: { promotionId: promo.id, memberId, status: "APPROVED" }
        })
      : Promise.resolve(0)
  ]);

  if (limits.perHour && perHourCount >= limits.perHour) {
    return { ok: false as const, reason: "LIMIT_PER_HOUR_REACHED", nextEligibleAt: hourRange(now).e };
  }
  if (limits.perDay && perDayCount >= limits.perDay) {
    return { ok: false as const, reason: "LIMIT_PER_DAY_REACHED", nextEligibleAt: dayRange(now).e };
  }
  if (limits.perWeek && perWeekCount >= limits.perWeek) {
    return { ok: false as const, reason: "LIMIT_PER_WEEK_REACHED", nextEligibleAt: weekRange(now).e };
  }
  if (limits.perMonth && perMonthCount >= limits.perMonth) {
    return { ok: false as const, reason: "LIMIT_PER_MONTH_REACHED", nextEligibleAt: monthRange(now).e };
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
  } else if (mode === "RANDOM") {
    // RANDOM: 在 [randMin, randMax] 之间随机生成，精确到分（0.01）
    const min = grant.randMin ?? 0;
    const max = grant.randMax ?? min;
    const range = Math.max(0, max - min);
    // 生成整数分（避免浮点误差），再转回 RM
    const minCents = Math.round(min * 100);
    const rangeCents = Math.round(range * 100);
    const randomCents = rangeCents > 0 ? Math.floor(Math.random() * (rangeCents + 1)) : 0;
    amount = new Prisma.Decimal((minCents + randomCents) / 100);
  } else {
    // PERCENT: bonus = baseAmount × (percent / 100)，优先用 ruleJson.grant.percent，否则用 promotion 表顶层 percent
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
