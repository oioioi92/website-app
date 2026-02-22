import type { NormalizedPromoRule } from "@/lib/promo/engine";

export type PromoTemplate = {
  key:
    | "DAILY_CLAIM_1"
    | "WEEKLY_CLAIM_3"
    | "LIFETIME_ONCE"
    | "FIRST_DEPOSIT"
    | "RELOAD_DAILY"
    | "FREE_CREDIT";
  label: string;
  description: string;
  rule: NormalizedPromoRule;
};

export const PROMO_TEMPLATES: PromoTemplate[] = [
  {
    key: "DAILY_CLAIM_1",
    label: "Daily Claim 1",
    description: "每天一次，10%，上限 50",
    rule: { version: 1, limits: { perDay: 1 }, eligible: {}, grant: { mode: "PERCENT", percent: 10, capAmount: 50 } }
  },
  {
    key: "WEEKLY_CLAIM_3",
    label: "Weekly Claim 3",
    description: "每周三次，10%，上限 100",
    rule: { version: 1, limits: { perWeek: 3 }, eligible: {}, grant: { mode: "PERCENT", percent: 10, capAmount: 100 } }
  },
  {
    key: "LIFETIME_ONCE",
    label: "Lifetime Once",
    description: "终身一次，20%，上限 200",
    rule: { version: 1, limits: { perLifetime: 1 }, eligible: {}, grant: { mode: "PERCENT", percent: 20, capAmount: 200 } }
  },
  {
    key: "FIRST_DEPOSIT",
    label: "First Deposit",
    description: "首充，终身一次，最低10，100%，上限200",
    rule: {
      version: 1,
      limits: { perLifetime: 1 },
      eligible: { minDeposit: 10 },
      grant: { mode: "PERCENT", percent: 100, capAmount: 200 }
    }
  },
  {
    key: "RELOAD_DAILY",
    label: "Reload Daily",
    description: "每日一次，最低10，10%，上限50",
    rule: {
      version: 1,
      limits: { perDay: 1 },
      eligible: { minDeposit: 10 },
      grant: { mode: "PERCENT", percent: 10, capAmount: 50 }
    }
  },
  {
    key: "FREE_CREDIT",
    label: "Free Credit",
    description: "每日一次，固定赠送 5",
    rule: { version: 1, limits: { perDay: 1 }, eligible: {}, grant: { mode: "FIXED", fixedAmount: 5 } }
  }
];
