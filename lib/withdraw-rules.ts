import { db } from "@/lib/db";

export const WITHDRAW_RULES_KEY = "settings_withdraw_rules";

export type WithdrawRules = {
  /** 单笔最低提现金额（如 50），空表示不限制 */
  minAmount: number | null;
  /** 单笔最高提现金额（如 50000），空表示不限制 */
  maxAmount: number | null;
  /** 每日提现次数上限，空表示不限制 */
  dailyLimitCount: number | null;
  /** 启用后：提现需满足上述限制 */
  enabled: boolean;
};

const defaults: WithdrawRules = {
  minAmount: null,
  maxAmount: null,
  dailyLimitCount: null,
  enabled: false,
};

export async function getWithdrawRules(): Promise<WithdrawRules> {
  const row = await db.siteSetting.findUnique({
    where: { key: WITHDRAW_RULES_KEY },
    select: { valueJson: true },
  });
  const v = row?.valueJson as Partial<WithdrawRules> | null;
  if (!v || typeof v !== "object") return { ...defaults };
  return {
    enabled: Boolean(v.enabled),
    minAmount: typeof v.minAmount === "number" && v.minAmount >= 0 ? v.minAmount : null,
    maxAmount: typeof v.maxAmount === "number" && v.maxAmount >= 0 ? v.maxAmount : null,
    dailyLimitCount: typeof v.dailyLimitCount === "number" && v.dailyLimitCount >= 0 ? v.dailyLimitCount : null,
  };
}
