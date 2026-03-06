import { db } from "@/lib/db";

export const DEPOSIT_TOPUP_RULES_KEY = "settings_deposit_topup_rules";

export type DepositTopupRules = {
  /** 启用后：当会员钱包余额 ≥ 此金额时，不可充值/入款 */
  enabled: boolean;
  /** 门槛金额（如 100 表示余额 ≥ 100 时不可 topup）。单位与钱包一致（如 MYR） */
  maxBalanceForTopup: number | null;
  /** 是否同时考虑游戏内余额（预留；当前仅用 wallet） */
  includeGameBalance?: boolean;
};

const defaults: DepositTopupRules = {
  enabled: false,
  maxBalanceForTopup: null,
  includeGameBalance: false,
};

export async function getDepositTopupRules(): Promise<DepositTopupRules> {
  const row = await db.siteSetting.findUnique({
    where: { key: DEPOSIT_TOPUP_RULES_KEY },
    select: { valueJson: true },
  });
  const v = row?.valueJson as Partial<DepositTopupRules> | null;
  if (!v || typeof v !== "object") return { ...defaults };
  return {
    enabled: Boolean(v.enabled),
    maxBalanceForTopup:
      typeof v.maxBalanceForTopup === "number" && v.maxBalanceForTopup >= 0 ? v.maxBalanceForTopup : null,
    includeGameBalance: Boolean(v.includeGameBalance),
  };
}

/** 获取会员当前钱包余额（WalletTransaction 汇总） */
export async function getMemberWalletBalance(memberId: string): Promise<number> {
  const r = await db.walletTransaction.aggregate({
    where: { memberId },
    _sum: { amountSigned: true },
  });
  return Number(r._sum.amountSigned ?? 0);
}

/**
 * 当启用规则且 maxBalanceForTopup 有效时：若 (钱包余额) >= maxBalanceForTopup 则不可充值。
 * 返回 { allowed: false, reason, currentBalance } 或 { allowed: true, currentBalance }。
 */
export async function checkCanTopup(memberId: string): Promise<
  | { allowed: true; currentBalance: number }
  | { allowed: false; reason: string; currentBalance: number }
> {
  const rules = await getDepositTopupRules();
  const walletBalance = await getMemberWalletBalance(memberId);
  if (!rules.enabled || rules.maxBalanceForTopup == null || rules.maxBalanceForTopup <= 0) {
    return { allowed: true, currentBalance: walletBalance };
  }
  if (walletBalance >= rules.maxBalanceForTopup) {
    return {
      allowed: false,
      reason: "BALANCE_TOO_HIGH_TO_TOPUP",
      currentBalance: walletBalance,
    };
  }
  return { allowed: true, currentBalance: walletBalance };
}
