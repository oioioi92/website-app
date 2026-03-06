/**
 * 后台筛选/搜索用到的选择项，与 API 实际支持的取值一致。
 * 单点维护，避免各页面重复或错误选项。
 */

export type SelectOption = { value: string; label: string };

/** 入款/出款列表（Operations + Records）使用的状态，与 DepositRequest/WithdrawalRequest 一致 */
export const REQUEST_STATUS_OPTIONS: SelectOption[] = [
  { value: "ALL", label: "全部" },
  { value: "PENDING", label: "PENDING" },
  { value: "PROCESSING", label: "PROCESSING" },
  { value: "APPROVED", label: "APPROVED" },
  { value: "REJECTED", label: "REJECTED" },
  { value: "COMPLETED", label: "COMPLETED" },
  { value: "PAID", label: "PAID" },
  { value: "BURNED", label: "BURNED" }
];

/** 仅入款列表常用（隐藏 PROCESSING/PAID 可简化 UI，按需展示） */
export const DEPOSIT_STATUS_OPTIONS: SelectOption[] = [
  { value: "ALL", label: "全部" },
  { value: "PENDING", label: "PENDING" },
  { value: "APPROVED", label: "APPROVED" },
  { value: "REJECTED", label: "REJECTED" },
  { value: "BURNED", label: "BURNED" }
];

/** 总流水（all-transactions）交易类型：来自 DepositRequest + WithdrawalRequest，仅 DEPOSIT/WITHDRAW */
export const TX_TYPE_ALL_OPTIONS: SelectOption[] = [
  { value: "ALL", label: "全部" },
  { value: "DEPOSIT", label: "DEPOSIT" },
  { value: "WITHDRAW", label: "WITHDRAW" }
];

/** 统一流水（ledger-transactions）交易类型：与 LedgerTx.txType 及 SLUG_EXTRA_PARAMS 一致 */
export const TX_TYPE_LEDGER_OPTIONS: SelectOption[] = [
  { value: "ALL", label: "全部" },
  { value: "DEPOSIT", label: "DEPOSIT" },
  { value: "WITHDRAW", label: "WITHDRAW" },
  { value: "BONUS_GRANTED", label: "BONUS_GRANTED" },
  { value: "BONUS_USED", label: "BONUS_USED" },
  { value: "BONUS_EXPIRED", label: "BONUS_EXPIRED" },
  { value: "TRANSFER_INTERNAL", label: "TRANSFER" },
  { value: "TRANSFER_TO_PROVIDER", label: "TRANSFER_TO_PROVIDER" },
  { value: "TRANSFER_FROM_PROVIDER", label: "TRANSFER_FROM_PROVIDER" },
  { value: "GAME_BET", label: "GAME_BET" },
  { value: "MANUAL_ADJUST", label: "ADJUST" }
];

/** 流水/Records 状态筛选（只读），与 getAllTransactions / getLedgerTransactions 一致 */
export const RECORDS_STATUS_OPTIONS: SelectOption[] = [
  { value: "ALL", label: "全部" },
  { value: "PENDING", label: "PENDING" },
  { value: "APPROVED", label: "APPROVED" },
  { value: "REJECTED", label: "REJECTED" },
  { value: "COMPLETED", label: "COMPLETED" },
  { value: "BURNED", label: "BURNED" }
];

/** 旧版 AdminReportView 等用的通用状态（win-lose 等 mock API） */
export const LEGACY_REPORT_STATUS_OPTIONS: SelectOption[] = [
  { value: "ALL", label: "全部" },
  { value: "PENDING", label: "PENDING" },
  { value: "COMPLETED", label: "COMPLETED" },
  { value: "CANCELLED", label: "CANCELLED" }
];
