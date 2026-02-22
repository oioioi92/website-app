/**
 * 指标字典（Metrics Dictionary）
 * 统一名词，避免报表口径不一致。
 */

/** Cash In（入款）：用户把钱打进平台（Deposit） */
export const CASH_IN = "Cash In";

/** Cash Out（出款）：平台打钱给用户（Withdraw） */
export const CASH_OUT = "Cash Out";

/** Transfer（转分）：用户在平台内部钱包/游戏之间移动分数（不应算收入） */
export const TRANSFER = "Transfer";

/** Turnover（流水）：下注金额总和（bet amount sum） */
export const TURNOVER = "Turnover";

/** Win/Lose（玩家输赢）：玩家净输赢（payout - bet） */
export const WIN_LOSE = "Win/Lose";

/** GGR（平台毛利）：GGR = - 玩家 Win/Lose（玩家输=平台赢） */
export const GGR = "GGR";

/** Bonus Cost（红利成本）：送出去的 bonus/free credit 金额 */
export const BONUS_COST = "Bonus Cost";

/** NGR（平台净利）：NGR = GGR - Bonus Cost */
export const NGR = "NGR";

/** Sales：统一为 GGR 或 NGR（主指标），报表中可同时显示 Turnover / BonusCost */
export const SALES = "Sales";

// ---------------------------------------------------------------------------
// Ledger 交易类型（tx_type）
// ---------------------------------------------------------------------------

export const TX_TYPE = {
  DEPOSIT: "DEPOSIT",
  WITHDRAW: "WITHDRAW",
  TRANSFER: "TRANSFER",
  GAME_BET: "GAME_BET",
  GAME_PAYOUT: "GAME_PAYOUT",
  BONUS_GRANTED: "BONUS_GRANTED",
  BONUS_USED: "BONUS_USED",
  BONUS_EXPIRED: "BONUS_EXPIRED",
  MANUAL_ADJUST: "MANUAL_ADJUST"
} as const;

export type TxType = (typeof TX_TYPE)[keyof typeof TX_TYPE];

export const TX_TYPE_LABELS: Record<TxType, string> = {
  [TX_TYPE.DEPOSIT]: "入款",
  [TX_TYPE.WITHDRAW]: "出款",
  [TX_TYPE.TRANSFER]: "转分",
  [TX_TYPE.GAME_BET]: "游戏下注",
  [TX_TYPE.GAME_PAYOUT]: "游戏派彩",
  [TX_TYPE.BONUS_GRANTED]: "红利发放",
  [TX_TYPE.BONUS_USED]: "红利使用",
  [TX_TYPE.BONUS_EXPIRED]: "红利过期",
  [TX_TYPE.MANUAL_ADJUST]: "人工调整"
};

// ---------------------------------------------------------------------------
// Ledger 状态
// ---------------------------------------------------------------------------

export const LEDGER_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  COMPLETED: "COMPLETED",
  BURNED: "BURNED",
  FAILED: "FAILED"
} as const;

export type LedgerStatus = (typeof LEDGER_STATUS)[keyof typeof LEDGER_STATUS];
