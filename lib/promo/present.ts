import type { Prisma } from "@prisma/client";
import { normalizeRule } from "@/lib/promo/engine";

export type PromoStatus = "PAUSED" | "SCHEDULED" | "EXPIRED" | "ACTIVE";

export function getPromoStatus(
  promo: { isClaimable: boolean; startAt?: string | Date | null; endAt?: string | Date | null },
  now = new Date()
): PromoStatus {
  if (!promo.isClaimable) return "PAUSED";
  const startAt = promo.startAt ? new Date(promo.startAt) : null;
  const endAt = promo.endAt ? new Date(promo.endAt) : null;
  if (startAt && now < startAt) return "SCHEDULED";
  if (endAt && now > endAt) return "EXPIRED";
  return "ACTIVE";
}

export function getLimitTag(ruleJson: Prisma.JsonValue | Record<string, unknown> | null | undefined) {
  const rule = normalizeRule(ruleJson as Prisma.JsonValue);
  const tags: string[] = [];
  if (rule.limits.perHour !== undefined) tags.push(`H${rule.limits.perHour}`);
  if (rule.limits.perDay !== undefined) tags.push(`D${rule.limits.perDay}`);
  if (rule.limits.perWeek !== undefined) tags.push(`W${rule.limits.perWeek}`);
  if (rule.limits.perMonth !== undefined) tags.push(`M${rule.limits.perMonth}`);
  if (rule.limits.perLifetime !== undefined) tags.push(`L${rule.limits.perLifetime}`);
  return tags.length > 0 ? tags.join("/") : "-";
}

export function getGrantTag(
  ruleJson: Prisma.JsonValue | Record<string, unknown> | null | undefined,
  promoFallbackPercent?: number
) {
  const rule = normalizeRule(ruleJson as Prisma.JsonValue);
  const cap = rule.grant.capAmount !== undefined ? ` cap ${rule.grant.capAmount}` : "";
  if (rule.grant.mode === "FIXED") {
    if (rule.grant.fixedAmount !== undefined) return `Fixed ${rule.grant.fixedAmount}${cap}`;
    return cap ? `Fixed 0${cap}` : "Fixed";
  }
  const p = rule.grant.percent ?? promoFallbackPercent;
  if (p !== undefined && p !== null) return `${p}%${cap}`;
  return "-";
}

export function getGroupLabel(ruleJson: Prisma.JsonValue | Record<string, unknown> | null | undefined) {
  if (!ruleJson || typeof ruleJson !== "object" || Array.isArray(ruleJson)) return "GENERAL";
  const obj = ruleJson as Record<string, unknown>;
  const meta = obj.meta && typeof obj.meta === "object" && !Array.isArray(obj.meta) ? (obj.meta as Record<string, unknown>) : null;
  const raw = (typeof obj.groupLabel === "string" ? obj.groupLabel : null) ?? (typeof meta?.category === "string" ? meta.category : null);
  if (!raw) return "OTHER";
  const label = raw.trim().toUpperCase();
  return label.length > 0 ? label : "OTHER";
}

/** 流水倍数文案，如 "x10"；无则返回空字符串 */
export function getTurnoverText(ruleJson: Prisma.JsonValue | Record<string, unknown> | null | undefined): string {
  if (!ruleJson || typeof ruleJson !== "object" || Array.isArray(ruleJson)) return "";
  const n = Number((ruleJson as Record<string, unknown>).turnover);
  return Number.isFinite(n) && n > 0 ? `x${n}` : "";
}

/** Rollover 展示文案（与 Turnover 为不同设定）；允许时可带倍数 e.g. "x20" */
export function getRolloverText(ruleJson: Prisma.JsonValue | Record<string, unknown> | null | undefined): string {
  if (!ruleJson || typeof ruleJson !== "object" || Array.isArray(ruleJson)) return "";
  const o = ruleJson as Record<string, unknown>;
  const v = o.rollover;
  const mul = Number(o.rolloverMultiplier);
  const allowed = v === true || v === "allowed" || (typeof v === "string" && v.toLowerCase() === "allowed");
  const notAllowed = v === false || v === "not_allowed" || (typeof v === "string" && v.toLowerCase() === "not_allowed");
  if (notAllowed) return "Not Allowed";
  if (allowed) return Number.isFinite(mul) && mul > 0 ? `x${mul}` : "Allowed";
  return "";
}
