/**
 * Transactions 统一页：预设筛选（一个入口替代多菜单项）
 */

export type TxPreset = {
  key: string;
  label: string;
  tooltip?: string;
  defaultFilters: Record<string, string | string[]>;
};

export const TX_PRESETS: TxPreset[] = [
  { key: "all", label: "All", tooltip: "全部流水", defaultFilters: {} },
  { key: "deposit", label: "Deposit", tooltip: "入款", defaultFilters: { txType: "DEPOSIT" } },
  { key: "withdraw", label: "Withdraw", tooltip: "提款", defaultFilters: { txType: "WITHDRAW" } },
  { key: "bonus", label: "Bonus", tooltip: "红利/赠送", defaultFilters: { txType: "BONUS_GRANTED,BONUS_USED,BONUS_EXPIRED" } },
  { key: "transfer", label: "Transfer", tooltip: "转分", defaultFilters: { txType: "TRANSFER_INTERNAL,TRANSFER_TO_PROVIDER,TRANSFER_FROM_PROVIDER" } },
  { key: "game", label: "Game", tooltip: "游戏下注/派奖", defaultFilters: { txType: "GAME_BET,GAME_PAYOUT,GAME_ROLLBACK" } },
  { key: "adjust", label: "Adjust", tooltip: "人工调账", defaultFilters: { txType: "MANUAL_ADJUST" } }
];
