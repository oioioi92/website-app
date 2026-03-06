import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ReportApiResponse, ReportColumn } from "@/lib/backoffice/report-api-types";

export const dynamic = "force-dynamic";

/** Escape CSV field (quote if contains comma, newline, or double quote) */
function csvEscape(val: unknown): string {
  const s = val == null ? "" : String(val);
  if (/[,"\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(body: ReportApiResponse): string {
  const cols = body.columns as ReportColumn[];
  const header = cols.map((c) => csvEscape(c.label)).join(",");
  const rows = body.rows.map((row) => cols.map((c) => csvEscape(row[c.key])).join(","));
  return [header, ...rows].join("\r\n");
}

const ALL_TRANSACTIONS_COLUMNS: ReportColumn[] = [
  { key: "created_at", label: "Time/Date", align: "left" },
  { key: "tx_id", label: "TX ID", align: "left" },
  { key: "user_id", label: "User ID", align: "left" },
  { key: "type", label: "Type", align: "left" },
  { key: "channel", label: "Channel", align: "left" },
  { key: "game_id", label: "Game", align: "left" },
  { key: "amount", label: "Amount", align: "right" },
  { key: "status", label: "Status", align: "left" },
  { key: "external_ref", label: "Reference", align: "left" },
  { key: "operator_id", label: "Processed By", align: "left" },
  { key: "elapsed", label: "Elapsed", align: "right" }
];

/**
 * Phase 1: All Transactions
 * 从现有 DepositRequest + WithdrawalRequest 合并为统一流水，返回 columns + rows + summary。
 * 后续可改为从 LedgerTx 查询。
 */
async function getAllTransactions(sp: URLSearchParams): Promise<ReportApiResponse> {
  const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10));
  const pageSize = Math.min(100, Math.max(10, parseInt(sp.get("pageSize") ?? "20", 10)));
  const dateFrom = sp.get("dateFrom");
  const dateTo = sp.get("dateTo");
  const userId = sp.get("userId")?.trim();
  const txType = sp.get("txType")?.trim() || "ALL";
  const status = sp.get("status")?.trim() || "ALL";
  const externalRef = sp.get("externalRef")?.trim();

  const whereDeposit: NonNullable<Prisma.DepositRequestFindManyArgs["where"]> = {};
  const whereWithdraw: NonNullable<Prisma.WithdrawalRequestFindManyArgs["where"]> = {};

  if (dateFrom || dateTo) {
    const range: { gte?: Date; lte?: Date } = {};
    if (dateFrom) range.gte = new Date(dateFrom);
    if (dateTo) {
      const d = new Date(dateTo);
      d.setHours(23, 59, 59, 999);
      range.lte = d;
    }
    whereDeposit.createdAt = range;
    whereWithdraw.createdAt = range;
  }
  if (userId) {
    whereDeposit.member = { userRef: userId };
    whereWithdraw.member = { userRef: userId };
  }
  if (status !== "ALL") {
    whereDeposit.status = status;
    whereWithdraw.status = status;
  }
  if (externalRef) {
    whereDeposit.referenceNo = { contains: externalRef };
    whereWithdraw.paymentReferenceNo = { contains: externalRef };
  }

  const limit = 500;
  const [deposits, withdrawals] = await Promise.all([
    txType === "WITHDRAW" ? [] : db.depositRequest.findMany({ where: whereDeposit, include: { member: { select: { userRef: true } } }, orderBy: { createdAt: "desc" }, take: limit }),
    txType === "DEPOSIT" ? [] : db.withdrawalRequest.findMany({ where: whereWithdraw, include: { member: { select: { userRef: true } } }, orderBy: { createdAt: "desc" }, take: limit })
  ]);

  type Row = Record<string, string | number | null>;
  const rows: Row[] = [];

  for (const d of deposits) {
    const completedAt = d.completedAt ?? d.firstActionAt ?? d.createdAt;
    const elapsed = d.processingDurationSec ?? (completedAt ? Math.round((completedAt.getTime() - d.createdAt.getTime()) / 1000) : null);
    rows.push({
      created_at: d.createdAt.toISOString(),
      tx_id: d.txId,
      user_id: d.member.userRef,
      type: "DEPOSIT",
      channel: d.channel,
      game_id: "",
      amount: Number(d.amount),
      status: d.status,
      external_ref: d.referenceNo ?? "",
      operator_id: d.handlerId ?? "",
      elapsed
    });
  }
  for (const w of withdrawals) {
    const completedAt = w.completedAt ?? w.firstActionAt ?? w.createdAt;
    const elapsed = w.processingDurationSec ?? (completedAt ? Math.round((completedAt.getTime() - w.createdAt.getTime()) / 1000) : null);
    rows.push({
      created_at: w.createdAt.toISOString(),
      tx_id: w.wdId,
      user_id: w.member.userRef,
      type: "WITHDRAW",
      channel: "bank",
      game_id: "",
      amount: -Number(w.amount),
      status: w.status,
      external_ref: w.paymentReferenceNo ?? "",
      operator_id: w.assignedTo ?? w.handlerId ?? "",
      elapsed
    });
  }

  rows.sort((a, b) => new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime());
  const total_count = rows.length;
  const paginated = rows.slice((page - 1) * pageSize, page * pageSize);
  // summary 用全量汇总（当前页之前的所有数据），不因分页改变

  const deposit_total = rows.filter((r) => r.type === "DEPOSIT").reduce((s, r) => s + (r.amount as number), 0);
  const withdraw_total = rows.filter((r) => r.type === "WITHDRAW").reduce((s, r) => s + Math.abs(r.amount as number), 0);

  return {
    report: "all_transactions",
    columns: ALL_TRANSACTIONS_COLUMNS,
    rows: paginated,
    summary: {
      total_count,
      deposit_total: Math.round(deposit_total * 100) / 100,
      withdraw_total: Math.round(withdraw_total * 100) / 100
    }
  };
}

const LEDGER_TRANSACTIONS_COLUMNS: ReportColumn[] = [
  { key: "effective_at", label: "Effective", align: "left" },
  { key: "tx_id", label: "TX ID", align: "left" },
  { key: "user_id", label: "User ID", align: "left" },
  { key: "type", label: "Type", align: "left" },
  { key: "channel", label: "Channel", align: "left" },
  { key: "game_code", label: "Game", align: "left" },
  { key: "amount", label: "Amount", align: "right" },
  { key: "status", label: "Status", align: "left" },
  { key: "external_ref", label: "Reference", align: "left" },
  { key: "correlation_id", label: "Correlation", align: "left" },
  { key: "provider", label: "Provider", align: "left" },
  { key: "operator_id", label: "Processed By", align: "left" }
];

async function getLedgerTransactions(sp: URLSearchParams): Promise<ReportApiResponse> {
  const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10));
  const pageSize = Math.min(100, Math.max(10, parseInt(sp.get("pageSize") ?? "20", 10)));
  const dateFrom = sp.get("from") ?? sp.get("dateFrom");
  const dateTo = sp.get("to") ?? sp.get("dateTo");
  const userId = sp.get("userId")?.trim();
  const txTypeRaw = sp.get("txType")?.trim() || sp.get("tx_type")?.trim();
  const status = sp.get("status")?.trim();
  const externalRef = sp.get("externalRef")?.trim();
  const correlationId = sp.get("correlationId")?.trim();
  const provider = sp.get("provider")?.trim();
  const gameCode = sp.get("gameCode")?.trim() ?? sp.get("game_code")?.trim();

  const where: Prisma.LedgerTxWhereInput = {};
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) (where.createdAt as { gte?: Date }).gte = new Date(dateFrom);
    if (dateTo) {
      const d = new Date(dateTo);
      d.setHours(23, 59, 59, 999);
      (where.createdAt as { lte?: Date }).lte = d;
    }
  }
  if (userId) where.userId = userId;
  if (txTypeRaw) {
    const types = txTypeRaw.split(",").map((s) => s.trim()).filter(Boolean);
    where.txType = types.length > 1 ? { in: types } : types[0];
  }
  if (status) where.status = status;
  if (externalRef) where.externalRef = { contains: externalRef };
  if (provider) where.provider = provider;
  if (gameCode) where.gameId = gameCode;

  const [rows, total_count] = await Promise.all([
    db.ledgerTx.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { lines: { select: { amount: true } } }
    }),
    db.ledgerTx.count({ where })
  ]);

  const rowAmount = (r: { lines: { amount: unknown }[] }) =>
    r.lines.reduce((s, l) => s + Number(l.amount), 0);
  const deposit_total = rows.filter((r) => r.txType === "DEPOSIT").reduce((s, r) => s + rowAmount(r), 0);
  const withdraw_total = rows.filter((r) => r.txType === "WITHDRAW").reduce((s, r) => s + rowAmount(r), 0);

  return {
    report: "ledger_transactions",
    columns: LEDGER_TRANSACTIONS_COLUMNS,
    rows: rows.map((r) => ({
      effective_at: (r.completedAt ?? r.createdAt).toISOString(),
      tx_id: r.txId,
      user_id: r.userId ?? "",
      type: r.txType,
      channel: r.channel ?? "",
      game_code: r.gameId ?? "",
      amount: rowAmount(r),
      status: r.status,
      external_ref: r.externalRef ?? "",
      correlation_id: "",
      provider: r.provider ?? "",
      operator_id: r.operatorId ?? ""
    })),
    summary: {
      total_count,
      deposit_total: Math.round(deposit_total * 100) / 100,
      withdraw_total: Math.round(withdraw_total * 100) / 100
    }
  };
}

const HOURLY_SALES_COLUMNS: ReportColumn[] = [
  { key: "hour_start", label: "Hour", align: "left" },
  { key: "currency", label: "Currency", align: "left" },
  { key: "deposit_total", label: "Deposit", align: "right" },
  { key: "withdraw_total", label: "Withdraw", align: "right" },
  { key: "turnover_total", label: "Turnover", align: "right" },
  { key: "payout_total", label: "Payout", align: "right" },
  { key: "ggr_total", label: "GGR", align: "right" },
  { key: "bonus_cost_total", label: "Bonus Cost", align: "right" },
  { key: "ngr_total", label: "NGR", align: "right" },
  { key: "tx_count", label: "Tx Count", align: "right" }
];

async function getHourlySales(_sp: URLSearchParams): Promise<ReportApiResponse> {
  // ReportHourlySales 等聚合表在 SQLite schema 中未定义，先返回空数据；使用 Postgres schema 时可恢复 db.reportHourlySales 查询
  return {
    report: "hourly_sales",
    columns: HOURLY_SALES_COLUMNS,
    rows: [],
    summary: { deposit_total: 0, withdraw_total: 0, turnover_total: 0, payout_total: 0, ggr_total: 0, bonus_cost_total: 0, ngr_total: 0, tx_count: 0, total_count: 0 }
  };
}

const WINLOSS_BY_GAME_COLUMNS: ReportColumn[] = [
  { key: "report_date", label: "Date", align: "left" },
  { key: "provider", label: "Provider", align: "left" },
  { key: "game_code", label: "Game", align: "left" },
  { key: "currency", label: "Currency", align: "left" },
  { key: "turnover_total", label: "Turnover", align: "right" },
  { key: "payout_total", label: "Payout", align: "right" },
  { key: "player_net", label: "Player Net", align: "right" },
  { key: "platform_ggr", label: "Platform GGR", align: "right" },
  { key: "unique_players", label: "Unique Players", align: "right" },
  { key: "bet_count", label: "Bet Count", align: "right" }
];

async function getWinlossByGame(_sp: URLSearchParams): Promise<ReportApiResponse> {
  // ReportDailyGameWinloss 在 SQLite schema 中未定义，先返回空数据；接入聚合表后可按 from/to/provider/gameCode 查询
  return {
    report: "winloss_by_game",
    columns: WINLOSS_BY_GAME_COLUMNS,
    rows: [],
    summary: { turnover_total: 0, payout_total: 0, platform_ggr: 0, bet_count: 0, total_count: 0 }
  };
}

const WINLOSS_BY_PLAYER_COLUMNS: ReportColumn[] = [
  { key: "user_id", label: "User ID", align: "left" },
  { key: "deposit_total", label: "Deposit", align: "right" },
  { key: "deposit_count", label: "Deposits", align: "right" },
  { key: "withdraw_total", label: "Withdraw", align: "right" },
  { key: "withdraw_count", label: "Withdrawals", align: "right" },
  { key: "player_net", label: "Player Net", align: "right" }
];

async function getWinlossByPlayer(sp: URLSearchParams): Promise<ReportApiResponse> {
  const dateFrom = sp.get("dateFrom") ?? sp.get("from");
  const dateTo = sp.get("dateTo") ?? sp.get("to");
  const range: { gte?: Date; lte?: Date } = {};
  if (dateFrom) range.gte = new Date(dateFrom);
  if (dateTo) {
    const d = new Date(dateTo);
    d.setHours(23, 59, 59, 999);
    range.lte = d;
  }
  const hasRange = Object.keys(range).length === 2;

  const [deposits, withdrawals] = hasRange
    ? await Promise.all([
        db.depositRequest.findMany({
          where: { createdAt: range, status: "COMPLETED" },
          include: { member: { select: { userRef: true } } },
        }),
        db.withdrawalRequest.findMany({
          where: { createdAt: range, status: "COMPLETED" },
          include: { member: { select: { userRef: true } } },
        }),
      ])
    : [[], []];

  const byUser = new Map<string, { deposit_total: number; deposit_count: number; withdraw_total: number; withdraw_count: number }>();
  for (const d of deposits) {
    const u = d.member.userRef;
    if (!byUser.has(u)) byUser.set(u, { deposit_total: 0, deposit_count: 0, withdraw_total: 0, withdraw_count: 0 });
    const row = byUser.get(u)!;
    row.deposit_total += Number(d.amount);
    row.deposit_count += 1;
  }
  for (const w of withdrawals) {
    const u = w.member.userRef;
    if (!byUser.has(u)) byUser.set(u, { deposit_total: 0, deposit_count: 0, withdraw_total: 0, withdraw_count: 0 });
    const row = byUser.get(u)!;
    row.withdraw_total += Number(w.amount);
    row.withdraw_count += 1;
  }

  const rows = Array.from(byUser.entries()).map(([user_id, r]) => ({
    user_id,
    deposit_total: Math.round(r.deposit_total * 100) / 100,
    deposit_count: r.deposit_count,
    withdraw_total: Math.round(r.withdraw_total * 100) / 100,
    withdraw_count: r.withdraw_count,
    player_net: Math.round((r.withdraw_total - r.deposit_total) * 100) / 100,
  }));
  const summary = rows.reduce(
    (s, r) => ({
      deposit_total: s.deposit_total + (r.deposit_total as number),
      withdraw_total: s.withdraw_total + (r.withdraw_total as number),
      total_count: rows.length,
    }),
    { deposit_total: 0, withdraw_total: 0, total_count: 0 }
  );
  return {
    report: "winloss_by_player",
    columns: WINLOSS_BY_PLAYER_COLUMNS,
    rows,
    summary: { ...summary, deposit_total: Math.round(summary.deposit_total * 100) / 100, withdraw_total: Math.round(summary.withdraw_total * 100) / 100 },
  };
}

const BONUS_COST_COLUMNS: ReportColumn[] = [
  { key: "report_date", label: "Date", align: "left" },
  { key: "currency", label: "Currency", align: "left" },
  { key: "bonus_granted_total", label: "Granted", align: "right" },
  { key: "bonus_used_total", label: "Used", align: "right" },
  { key: "bonus_expired_total", label: "Expired", align: "right" },
  { key: "unique_users", label: "Unique Users", align: "right" }
];

async function getBonusCost(_sp: URLSearchParams): Promise<ReportApiResponse> {
  // ReportDailyBonusCost 在 SQLite schema 中未定义，先返回空数据
  return {
    report: "bonus_cost",
    columns: BONUS_COST_COLUMNS,
    rows: [],
    summary: { bonus_granted_total: 0, bonus_used_total: 0, bonus_expired_total: 0, total_count: 0 }
  };
}

const USER_KPI_COLUMNS: ReportColumn[] = [
  { key: "report_date", label: "Date", align: "left" },
  { key: "user_id", label: "User ID", align: "left" },
  { key: "currency", label: "Currency", align: "left" },
  { key: "deposit_total", label: "Deposit", align: "right" },
  { key: "deposit_count", label: "Deposits", align: "right" },
  { key: "withdraw_total", label: "Withdraw", align: "right" },
  { key: "withdraw_count", label: "Withdrawals", align: "right" },
  { key: "turnover_total", label: "Turnover", align: "right" },
  { key: "payout_total", label: "Payout", align: "right" },
  { key: "player_net", label: "Player Net", align: "right" },
  { key: "bonus_granted_total", label: "Bonus", align: "right" }
];

const TOP_REFERRER_COLUMNS: ReportColumn[] = [
  { key: "rank", label: "Rank", align: "right" },
  { key: "referrer_id", label: "Referrer ID", align: "left" },
  { key: "referrer_name", label: "Name", align: "left" },
  { key: "referral_count", label: "Referrals", align: "right" }
];

const PROMOTION_REPORT_COLUMNS: ReportColumn[] = [
  { key: "id", label: "ID", align: "left" },
  { key: "title", label: "Title", align: "left" },
  { key: "is_active", label: "Active", align: "left" },
  { key: "sort_order", label: "Sort", align: "right" },
  { key: "start_at", label: "Start", align: "left" },
  { key: "end_at", label: "End", align: "left" },
  { key: "claim_count", label: "Claims", align: "right" },
  { key: "created_at", label: "Created", align: "left" }
];

async function getPromotionReport(sp: URLSearchParams): Promise<ReportApiResponse> {
  const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10));
  const pageSize = Math.min(100, Math.max(10, parseInt(sp.get("pageSize") ?? "20", 10)));
  const skip = (page - 1) * pageSize;
  const activeOnly = sp.get("active") === "1";

  const where = activeOnly ? { isActive: true } : {};
  const [list, total] = await Promise.all([
    db.promotion.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      skip,
      take: pageSize,
      select: {
        id: true,
        title: true,
        isActive: true,
        sortOrder: true,
        createdAt: true,
        startAt: true,
        endAt: true,
        _count: { select: { claims: true } },
      },
    }),
    db.promotion.count({ where }),
  ]);

  type Row = Record<string, string | number | null>;
  const rows: Row[] = list.map((p) => ({
    id: p.id,
    title: p.title,
    is_active: p.isActive ? "Yes" : "No",
    sort_order: p.sortOrder,
    start_at: p.startAt ? p.startAt.toISOString().slice(0, 10) : "",
    end_at: p.endAt ? p.endAt.toISOString().slice(0, 10) : "",
    claim_count: p._count.claims,
    created_at: p.createdAt.toISOString().slice(0, 19),
  }));

  return {
    report: "promotion-report",
    columns: PROMOTION_REPORT_COLUMNS,
    rows,
    summary: { total_count: total, page, pageSize },
  };
}

const COMMISSION_REPORT_COLUMNS: ReportColumn[] = [
  { key: "referrer_id", label: "Referrer ID", align: "left" },
  { key: "referrer_name", label: "Name", align: "left" },
  { key: "referral_count", label: "Referrals", align: "right" },
  { key: "downline_deposit_total", label: "Downline Deposit", align: "right" },
  { key: "downline_withdraw_total", label: "Downline Withdraw", align: "right" },
];

const STAFF_REPORT_COLUMNS: ReportColumn[] = [
  { key: "id", label: "ID", align: "left" },
  { key: "email", label: "Email", align: "left" },
  { key: "role", label: "Role", align: "left" },
  { key: "totp_enabled", label: "2FA", align: "left" },
  { key: "created_at", label: "Created", align: "left" },
];

async function getStaffReport(sp: URLSearchParams): Promise<ReportApiResponse> {
  const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10));
  const pageSize = Math.min(100, Math.max(10, parseInt(sp.get("pageSize") ?? "20", 10)));
  const skip = (page - 1) * pageSize;

  const [list, total] = await Promise.all([
    db.adminUser.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        email: true,
        role: true,
        totpEnabled: true,
        createdAt: true,
      },
    }),
    db.adminUser.count(),
  ]);

  const rows = list.map((u) => ({
    id: u.id,
    email: u.email,
    role: u.role,
    totp_enabled: u.totpEnabled ? "Yes" : "No",
    created_at: u.createdAt.toISOString().slice(0, 19),
  }));

  return {
    report: "staff",
    columns: STAFF_REPORT_COLUMNS,
    rows,
    summary: { total_count: total, page, pageSize },
  };
}

const ACTIVITY_LOG_REPORT_COLUMNS: ReportColumn[] = [
  { key: "created_at", label: "Time", align: "left" },
  { key: "staff", label: "Staff", align: "left" },
  { key: "action", label: "Action", align: "left" },
  { key: "entity_type", label: "Entity Type", align: "left" },
  { key: "entity_id", label: "Entity ID", align: "left" },
  { key: "ip", label: "IP", align: "left" },
];

async function getActivityLogReport(sp: URLSearchParams): Promise<ReportApiResponse> {
  const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10));
  const pageSize = Math.min(100, Math.max(10, parseInt(sp.get("pageSize") ?? "20", 10)));
  const skip = (page - 1) * pageSize;
  const actionFilter = sp.get("action")?.trim();

  const where = actionFilter ? { action: actionFilter } : {};
  const [list, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: { actor: { select: { email: true } } },
    }),
    db.auditLog.count({ where }),
  ]);

  const rows = list.map((l) => ({
    created_at: l.createdAt.toISOString().slice(0, 19),
    staff: l.actor.email,
    action: l.action,
    entity_type: l.entityType,
    entity_id: l.entityId,
    ip: l.ip ?? "",
  }));

  return {
    report: "activity-log",
    columns: ACTIVITY_LOG_REPORT_COLUMNS,
    rows,
    summary: { total_count: total, page, pageSize },
  };
}

const REBATE_ANGPAO_REPORT_COLUMNS: ReportColumn[] = [
  { key: "claimed_at", label: "Claimed At", align: "left" },
  { key: "user_id", label: "User ID", align: "left" },
  { key: "promotion_title", label: "Promotion", align: "left" },
  { key: "status", label: "Status", align: "left" },
  { key: "amount_granted", label: "Amount", align: "right" },
];

async function getRebateAngpaoReport(sp: URLSearchParams): Promise<ReportApiResponse> {
  const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10));
  const pageSize = Math.min(100, Math.max(10, parseInt(sp.get("pageSize") ?? "20", 10)));
  const skip = (page - 1) * pageSize;

  const [list, total] = await Promise.all([
    db.promotionClaim.findMany({
      orderBy: { claimedAt: "desc" },
      skip,
      take: pageSize,
      include: {
        promotion: { select: { title: true } },
        member: { select: { userRef: true } },
      },
    }),
    db.promotionClaim.count(),
  ]);

  const rows = list.map((c) => ({
    claimed_at: c.claimedAt.toISOString().slice(0, 19),
    user_id: c.member.userRef,
    promotion_title: c.promotion.title,
    status: c.status,
    amount_granted: c.amountGranted != null ? Number(c.amountGranted) : null,
  }));

  const totalAmount = list.reduce((s, c) => s + (c.amountGranted != null ? Number(c.amountGranted) : 0), 0);
  return {
    report: "rebate-angpao",
    columns: REBATE_ANGPAO_REPORT_COLUMNS,
    rows,
    summary: { total_count: total, page, pageSize, amount_granted_total: Math.round(totalAmount * 100) / 100 },
  };
}

const MANUAL_REPORT_COLUMNS: ReportColumn[] = [
  { key: "created_at", label: "Time", align: "left" },
  { key: "tx_id", label: "TX ID", align: "left" },
  { key: "user_id", label: "User ID", align: "left" },
  { key: "type", label: "Type", align: "left" },
  { key: "amount", label: "Amount", align: "right" },
  { key: "remark", label: "Remark", align: "left" },
];

async function getManualReport(sp: URLSearchParams): Promise<ReportApiResponse> {
  const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10));
  const pageSize = Math.min(100, Math.max(10, parseInt(sp.get("pageSize") ?? "20", 10)));
  const skip = (page - 1) * pageSize;
  const manualTypes = ["MANUAL", "ADJUSTMENT", "CORRECTION", "MANUAL_CREDIT", "MANUAL_DEBIT"];
  const where = { txType: { in: manualTypes } };
  const [list, total] = await Promise.all([
    db.ledgerTx.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: { lines: { select: { amount: true } } },
    }),
    db.ledgerTx.count({ where }),
  ]);
  const rowAmount = (r: { lines: { amount: unknown }[] }) => r.lines.reduce((s: number, l) => s + Number(l.amount), 0);
  const rows = list.map((r) => ({
    created_at: (r.completedAt ?? r.createdAt).toISOString().slice(0, 19),
    tx_id: r.txId,
    user_id: r.userId ?? "",
    type: r.txType,
    amount: Math.round(rowAmount(r) * 100) / 100,
    remark: r.remark ?? "",
  }));
  return {
    report: "manual",
    columns: MANUAL_REPORT_COLUMNS,
    rows,
    summary: { total_count: total, page, pageSize },
  };
}

const FEEDBACK_REPORT_COLUMNS: ReportColumn[] = [
  { key: "created_at", label: "Date", align: "left" },
  { key: "user_id", label: "User ID", align: "left" },
  { key: "message", label: "Message", align: "left" },
  { key: "status", label: "Status", align: "left" },
];

async function getFeedbackReport(sp: URLSearchParams): Promise<ReportApiResponse> {
  const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10));
  const pageSize = Math.min(100, Math.max(10, parseInt(sp.get("pageSize") ?? "20", 10)));
  const skip = (page - 1) * pageSize;
  try {
    const [list, total] = await Promise.all([
      db.feedback.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      db.feedback.count(),
    ]);
    const rows = list.map((f) => ({
      created_at: f.createdAt.toISOString().slice(0, 19),
      user_id: f.userRef ?? f.userId ?? "",
      message: f.message,
      status: f.status,
    }));
    return {
      report: "feedback",
      columns: FEEDBACK_REPORT_COLUMNS,
      rows,
      summary: { total_count: total, page, pageSize },
    };
  } catch {
    return { report: "feedback", columns: FEEDBACK_REPORT_COLUMNS, rows: [], summary: { total_count: 0 } };
  }
}

const LEADERBOARD_REPORT_COLUMNS: ReportColumn[] = [
  { key: "rank", label: "Rank", align: "right" },
  { key: "user_id", label: "User ID", align: "left" },
  { key: "display_name", label: "Name", align: "left" },
  { key: "deposit_total", label: "Deposit Total", align: "right" },
  { key: "deposit_count", label: "Deposits", align: "right" },
  { key: "withdraw_total", label: "Withdraw Total", align: "right" },
];

async function getLeaderboardReport(_sp: URLSearchParams): Promise<ReportApiResponse> {
  const deposits = await db.depositRequest.findMany({
    where: { status: "COMPLETED" },
    select: { amount: true, member: { select: { id: true, userRef: true, displayName: true } } },
  });
  const withdrawals = await db.withdrawalRequest.findMany({
    where: { status: "COMPLETED" },
    select: { amount: true, member: { select: { id: true, userRef: true, displayName: true } } },
  });
  const byUser = new Map<string, { user_id: string; display_name: string; deposit_total: number; deposit_count: number; withdraw_total: number }>();
  for (const d of deposits) {
    const u = d.member.userRef;
    if (!byUser.has(u)) byUser.set(u, { user_id: u, display_name: d.member.displayName ?? u, deposit_total: 0, deposit_count: 0, withdraw_total: 0 });
    const row = byUser.get(u)!;
    row.deposit_total += Number(d.amount);
    row.deposit_count += 1;
  }
  for (const w of withdrawals) {
    const u = w.member.userRef;
    if (!byUser.has(u)) byUser.set(u, { user_id: u, display_name: w.member.displayName ?? u, deposit_total: 0, deposit_count: 0, withdraw_total: 0 });
    const row = byUser.get(u)!;
    row.withdraw_total += Number(w.amount);
  }
  const rows = Array.from(byUser.values())
    .map((r) => ({
      user_id: r.user_id,
      display_name: r.display_name,
      deposit_total: Math.round(r.deposit_total * 100) / 100,
      deposit_count: r.deposit_count,
      withdraw_total: Math.round(r.withdraw_total * 100) / 100,
    }))
    .sort((a, b) => (b.deposit_total as number) - (a.deposit_total as number))
    .map((r, i) => ({ ...r, rank: i + 1 }));
  return {
    report: "leaderboard",
    columns: LEADERBOARD_REPORT_COLUMNS,
    rows,
    summary: { total_count: rows.length },
  };
}

const REFERRER_CLICK_REPORT_COLUMNS: ReportColumn[] = [
  { key: "clicked_at", label: "Time", align: "left" },
  { key: "referrer_id", label: "Referrer ID", align: "left" },
  { key: "source", label: "Source", align: "left" },
  { key: "ip", label: "IP", align: "left" },
];

async function getReferrerClickReport(sp: URLSearchParams): Promise<ReportApiResponse> {
  const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10));
  const pageSize = Math.min(100, Math.max(10, parseInt(sp.get("pageSize") ?? "20", 10)));
  const skip = (page - 1) * pageSize;
  try {
    const [list, total] = await Promise.all([
      db.referrerClick.findMany({
        orderBy: { clickedAt: "desc" },
        skip,
        take: pageSize,
      }),
      db.referrerClick.count(),
    ]);
    const rows = list.map((r) => ({
      clicked_at: r.clickedAt.toISOString().slice(0, 19),
      referrer_id: r.referrerId ?? "",
      source: r.source ?? "",
      ip: r.ip ?? "",
    }));
    return {
      report: "referrer-click",
      columns: REFERRER_CLICK_REPORT_COLUMNS,
      rows,
      summary: { total_count: total, page, pageSize },
    };
  } catch {
    return { report: "referrer-click", columns: REFERRER_CLICK_REPORT_COLUMNS, rows: [], summary: { total_count: 0 } };
  }
}

const LUCKY_NUMBER_REPORT_COLUMNS: ReportColumn[] = [
  { key: "draw_date", label: "Draw Date", align: "left" },
  { key: "number", label: "Number", align: "left" },
  { key: "type", label: "Type", align: "left" },
  { key: "result", label: "Result", align: "left" },
];

async function getLuckyNumberReport(_sp: URLSearchParams): Promise<ReportApiResponse> {
  return {
    report: "lucky-number",
    columns: LUCKY_NUMBER_REPORT_COLUMNS,
    rows: [],
    summary: { total_count: 0 },
  };
}

const LUCKY_DRAW_4D_REPORT_COLUMNS: ReportColumn[] = [
  { key: "draw_date", label: "Draw Date", align: "left" },
  { key: "number", label: "Number", align: "left" },
  { key: "prize_tier", label: "Prize Tier", align: "left" },
  { key: "result", label: "Result", align: "left" },
];

async function getLuckyDraw4dReport(_sp: URLSearchParams): Promise<ReportApiResponse> {
  return {
    report: "lucky-draw-4d",
    columns: LUCKY_DRAW_4D_REPORT_COLUMNS,
    rows: [],
    summary: { total_count: 0 },
  };
}

async function getCommissionReport(_sp: URLSearchParams): Promise<ReportApiResponse> {
  const [referrers, deposits, withdrawals] = await Promise.all([
    db.member.findMany({
      where: { referrals: { some: {} } },
      select: {
        id: true,
        userRef: true,
        displayName: true,
        _count: { select: { referrals: true } },
      },
    }),
    db.depositRequest.findMany({
      where: { status: "COMPLETED" },
      select: { amount: true, member: { select: { referrerId: true } } },
    }),
    db.withdrawalRequest.findMany({
      where: { status: "COMPLETED" },
      select: { amount: true, member: { select: { referrerId: true } } },
    }),
  ]);

  const depositByReferrer: Record<string, number> = {};
  const withdrawByReferrer: Record<string, number> = {};
  for (const d of deposits) {
    const rid = d.member?.referrerId ?? "";
    if (rid) {
      depositByReferrer[rid] = (depositByReferrer[rid] ?? 0) + Number(d.amount);
    }
  }
  for (const w of withdrawals) {
    const rid = w.member?.referrerId ?? "";
    if (rid) {
      withdrawByReferrer[rid] = (withdrawByReferrer[rid] ?? 0) + Number(w.amount);
    }
  }

  const rows = referrers
    .map((m) => ({
      referrer_id: m.userRef,
      referrer_name: m.displayName ?? m.userRef,
      referral_count: m._count.referrals,
      downline_deposit_total: Math.round((depositByReferrer[m.id] ?? 0) * 100) / 100,
      downline_withdraw_total: Math.round((withdrawByReferrer[m.id] ?? 0) * 100) / 100,
    }))
    .sort((a, b) => (b.referral_count as number) - (a.referral_count as number));

  const totalDeposit = rows.reduce((s, r) => s + (r.downline_deposit_total as number), 0);
  const totalWithdraw = rows.reduce((s, r) => s + (r.downline_withdraw_total as number), 0);
  return {
    report: "commission",
    columns: COMMISSION_REPORT_COLUMNS,
    rows,
    summary: { total_count: rows.length, downline_deposit_total: totalDeposit, downline_withdraw_total: totalWithdraw },
  };
}

async function getTopReferrers(_sp: URLSearchParams): Promise<ReportApiResponse> {
  const list = await db.member.findMany({
    where: { referrals: { some: {} } },
    select: {
      id: true,
      userRef: true,
      displayName: true,
      _count: { select: { referrals: true } },
    },
  });
  const rows = list
    .map((m) => ({
      referrer_id: m.userRef,
      referrer_name: m.displayName ?? m.userRef,
      referral_count: m._count.referrals,
    }))
    .sort((a, b) => (b.referral_count as number) - (a.referral_count as number))
    .map((r, i) => ({ ...r, rank: i + 1 }));
  const totalReferrals = rows.reduce((s, r) => s + (r.referral_count as number), 0);
  return {
    report: "top_referrer",
    columns: TOP_REFERRER_COLUMNS,
    rows,
    summary: { total_count: rows.length, referral_count_total: totalReferrals },
  };
}

const GATEWAY_SEARCH_COLUMNS: ReportColumn[] = [
  { key: "created_at", label: "Time/Date", align: "left" },
  { key: "tx_id", label: "TX ID", align: "left" },
  { key: "user_id", label: "User ID", align: "left" },
  { key: "type", label: "Type", align: "left" },
  { key: "channel", label: "Channel", align: "left" },
  { key: "amount", label: "Amount", align: "right" },
  { key: "status", label: "Status", align: "left" },
  { key: "external_ref", label: "Reference", align: "left" }
];

async function getGatewaySearch(sp: URLSearchParams): Promise<ReportApiResponse> {
  const ref = sp.get("externalRef")?.trim() ?? sp.get("reference")?.trim();
  const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10));
  const pageSize = Math.min(100, Math.max(10, parseInt(sp.get("pageSize") ?? "20", 10)));
  const skip = (page - 1) * pageSize;

  type Row = Record<string, string | number | null>;
  const rows: Row[] = [];

  if (ref) {
    const [ledger, deposits, withdrawals] = await Promise.all([
      db.ledgerTx.findMany({
        where: { externalRef: { contains: ref } },
        orderBy: { createdAt: "desc" },
        take: 200,
        include: { lines: { select: { amount: true } } },
      }),
      db.depositRequest.findMany({
        where: { referenceNo: { contains: ref } },
        include: { member: { select: { userRef: true } } },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
      db.withdrawalRequest.findMany({
        where: { paymentReferenceNo: { contains: ref } },
        include: { member: { select: { userRef: true } } },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
    ]);

    const amount = (r: { lines: { amount: unknown }[] }) => r.lines.reduce((s, l) => s + Number(l.amount), 0);
    for (const r of ledger) {
      rows.push({
        created_at: (r.completedAt ?? r.createdAt).toISOString(),
        tx_id: r.txId,
        user_id: r.userId ?? "",
        type: r.txType,
        channel: r.channel ?? "",
        amount: Math.round(amount(r) * 100) / 100,
        status: r.status,
        external_ref: r.externalRef ?? "",
      });
    }
    for (const d of deposits) {
      rows.push({
        created_at: (d.completedAt ?? d.firstActionAt ?? d.createdAt)?.toISOString() ?? d.createdAt.toISOString(),
        tx_id: d.txId,
        user_id: d.member.userRef,
        type: "DEPOSIT",
        channel: d.channel,
        amount: Number(d.amount),
        status: d.status,
        external_ref: d.referenceNo ?? "",
      });
    }
    for (const w of withdrawals) {
      rows.push({
        created_at: (w.completedAt ?? w.firstActionAt ?? w.createdAt)?.toISOString() ?? w.createdAt.toISOString(),
        tx_id: w.wdId,
        user_id: w.member.userRef,
        type: "WITHDRAW",
        channel: "",
        amount: -Number(w.amount),
        status: w.status,
        external_ref: w.paymentReferenceNo ?? "",
      });
    }
    rows.sort((a, b) => String(a.created_at).localeCompare(String(b.created_at), undefined, { numeric: true }) * -1);
  }

  const total_count = rows.length;
  const paged = rows.slice(skip, skip + pageSize);
  const deposit_total = rows.filter((r) => r.type === "DEPOSIT").reduce((s, r) => s + Number(r.amount), 0);
  const withdraw_total = rows.filter((r) => r.type === "WITHDRAW").reduce((s, r) => s + Math.abs(Number(r.amount)), 0);

  return {
    report: "gateway_search",
    columns: GATEWAY_SEARCH_COLUMNS,
    rows: paged,
    summary: { total_count, deposit_total: Math.round(deposit_total * 100) / 100, withdraw_total: Math.round(withdraw_total * 100) / 100 },
  };
}

const RECONCILIATION_COLUMNS: ReportColumn[] = [
  { key: "report_date", label: "Date", align: "left" },
  { key: "channel", label: "Channel", align: "left" },
  { key: "deposit_count", label: "Deposits", align: "right" },
  { key: "deposit_total", label: "Deposit Amount", align: "right" },
  { key: "withdraw_count", label: "Withdrawals", align: "right" },
  { key: "withdraw_total", label: "Withdraw Amount", align: "right" },
  { key: "net", label: "Net", align: "right" }
];

async function getReconciliation(sp: URLSearchParams): Promise<ReportApiResponse> {
  const dateFrom = sp.get("dateFrom") ?? sp.get("from");
  const dateTo = sp.get("dateTo") ?? sp.get("to");
  const range: { gte?: Date; lte?: Date } = {};
  if (dateFrom) range.gte = new Date(dateFrom);
  if (dateTo) {
    const d = new Date(dateTo);
    d.setHours(23, 59, 59, 999);
    range.lte = d;
  }
  const hasRange = Object.keys(range).length === 2;

  const [deposits, withdrawals] = hasRange
    ? await Promise.all([
        db.depositRequest.findMany({ where: { createdAt: range, status: "COMPLETED" }, select: { amount: true, channel: true, createdAt: true } }),
        db.withdrawalRequest.findMany({ where: { createdAt: range, status: "COMPLETED" }, select: { amount: true, createdAt: true } }),
      ])
    : [[], []];

  const byDay = new Map<string, { report_date: string; channel: string; deposit_count: number; deposit_total: number; withdraw_count: number; withdraw_total: number; net: number }>();
  const dayStr = (d: Date) => d.toISOString().slice(0, 10);
  for (const d of deposits) {
    const key = dayStr(d.createdAt);
    if (!byDay.has(key)) byDay.set(key, { report_date: key, channel: "—", deposit_count: 0, deposit_total: 0, withdraw_count: 0, withdraw_total: 0, net: 0 });
    const row = byDay.get(key)!;
    row.deposit_count += 1;
    row.deposit_total += Number(d.amount);
  }
  for (const w of withdrawals) {
    const key = dayStr(w.createdAt);
    if (!byDay.has(key)) byDay.set(key, { report_date: key, channel: "—", deposit_count: 0, deposit_total: 0, withdraw_count: 0, withdraw_total: 0, net: 0 });
    const row = byDay.get(key)!;
    row.withdraw_count += 1;
    row.withdraw_total += Number(w.amount);
  }
  const rows = Array.from(byDay.values()).map((r) => ({
    ...r,
    deposit_total: Math.round(r.deposit_total * 100) / 100,
    withdraw_total: Math.round(r.withdraw_total * 100) / 100,
    net: Math.round((r.deposit_total - r.withdraw_total) * 100) / 100,
  }));
  rows.sort((a, b) => b.report_date.localeCompare(a.report_date));
  const sum = rows.reduce(
    (s, r) => ({
      deposit_count: s.deposit_count + r.deposit_count,
      deposit_total: s.deposit_total + (r.deposit_total as number),
      withdraw_count: s.withdraw_count + r.withdraw_count,
      withdraw_total: s.withdraw_total + (r.withdraw_total as number),
    }),
    { deposit_count: 0, deposit_total: 0, withdraw_count: 0, withdraw_total: 0 }
  );
  return {
    report: "reconciliation",
    columns: RECONCILIATION_COLUMNS,
    rows,
    summary: {
      total_count: rows.length,
      deposit_total: Math.round(sum.deposit_total * 100) / 100,
      withdraw_total: Math.round(sum.withdraw_total * 100) / 100,
      deposit_count: sum.deposit_count,
      withdraw_count: sum.withdraw_count,
    },
  };
}

const TRANSACTION_REPORT_COLUMNS: ReportColumn[] = [
  { key: "period_label", label: "Date", align: "left" },
  { key: "deposit_count", label: "Deposit (Count)", align: "right" },
  { key: "deposit_total", label: "Deposit (Amount)", align: "right" },
  { key: "withdraw_count", label: "Withdraw (Count)", align: "right" },
  { key: "withdraw_total", label: "Withdraw (Amount)", align: "right" },
  { key: "net", label: "Net", align: "right" },
];

async function getTransactionReport(sp: URLSearchParams): Promise<ReportApiResponse> {
  const dateFrom = sp.get("dateFrom") ?? sp.get("from");
  const dateTo = sp.get("dateTo") ?? sp.get("to");
  const groupBy = (sp.get("groupBy") ?? "daily") as "daily" | "monthly" | "yearly";
  const typeFilter = (sp.get("type") ?? sp.get("typeFilter") ?? "All") as "All" | "Deposit" | "Withdraw";
  const range: { gte?: Date; lte?: Date } = {};
  if (dateFrom) range.gte = new Date(dateFrom);
  if (dateTo) {
    const d = new Date(dateTo);
    d.setHours(23, 59, 59, 999);
    range.lte = d;
  }
  const hasRange = Object.keys(range).length >= 1;
  if (!hasRange) {
    const today = new Date();
    range.gte = new Date(today.getFullYear(), today.getMonth(), 1);
    range.lte = new Date(today);
    range.lte.setHours(23, 59, 59, 999);
  }
  const [deposits, withdrawals] = await Promise.all([
    typeFilter !== "Withdraw"
      ? db.depositRequest.findMany({
          where: { createdAt: range, status: "COMPLETED" },
          select: { amount: true, createdAt: true },
        })
      : [],
    typeFilter !== "Deposit"
      ? db.withdrawalRequest.findMany({
          where: { createdAt: range, status: "COMPLETED" },
          select: { amount: true, createdAt: true },
        })
      : [],
  ]);
  const periodKey = (d: Date) => {
    if (groupBy === "yearly") return d.getFullYear().toString();
    if (groupBy === "monthly") return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return d.toISOString().slice(0, 10);
  };
  const periodLabel = (key: string) => {
    if (groupBy === "yearly") return key;
    if (groupBy === "monthly") return `${key}-01`;
    return key;
  };
  const byPeriod = new Map<string, { deposit_count: number; deposit_total: number; withdraw_count: number; withdraw_total: number }>();
  for (const d of deposits) {
    const key = periodKey(d.createdAt);
    if (!byPeriod.has(key)) byPeriod.set(key, { deposit_count: 0, deposit_total: 0, withdraw_count: 0, withdraw_total: 0 });
    const row = byPeriod.get(key)!;
    row.deposit_count += 1;
    row.deposit_total += Number(d.amount);
  }
  for (const w of withdrawals) {
    const key = periodKey(w.createdAt);
    if (!byPeriod.has(key)) byPeriod.set(key, { deposit_count: 0, deposit_total: 0, withdraw_count: 0, withdraw_total: 0 });
    const row = byPeriod.get(key)!;
    row.withdraw_count += 1;
    row.withdraw_total += Number(w.amount);
  }
  const rows = Array.from(byPeriod.entries())
    .map(([key, r]) => ({
      period_label: periodLabel(key),
      deposit_count: r.deposit_count,
      deposit_total: Math.round(r.deposit_total * 100) / 100,
      withdraw_count: r.withdraw_count,
      withdraw_total: Math.round(r.withdraw_total * 100) / 100,
      net: Math.round((r.deposit_total - r.withdraw_total) * 100) / 100,
    }))
    .sort((a, b) => String(a.period_label).localeCompare(String(b.period_label)));
  const sum = rows.reduce(
    (s, r) => ({
      deposit_count: s.deposit_count + r.deposit_count,
      deposit_total: s.deposit_total + (r.deposit_total as number),
      withdraw_count: s.withdraw_count + r.withdraw_count,
      withdraw_total: s.withdraw_total + (r.withdraw_total as number),
    }),
    { deposit_count: 0, deposit_total: 0, withdraw_count: 0, withdraw_total: 0 }
  );
  return {
    report: "transaction_report",
    columns: TRANSACTION_REPORT_COLUMNS,
    rows,
    summary: {
      total_periods: rows.length,
      deposit_count: sum.deposit_count,
      deposit_total: Math.round(sum.deposit_total * 100) / 100,
      withdraw_count: sum.withdraw_count,
      withdraw_total: Math.round(sum.withdraw_total * 100) / 100,
      net: Math.round((sum.deposit_total - sum.withdraw_total) * 100) / 100,
    },
  };
}

async function getUserKpi(sp: URLSearchParams): Promise<ReportApiResponse> {
  const dateFrom = sp.get("dateFrom") ?? sp.get("from");
  const dateTo = sp.get("dateTo") ?? sp.get("to");
  const range: { gte?: Date; lte?: Date } = {};
  if (dateFrom) range.gte = new Date(dateFrom);
  if (dateTo) {
    const d = new Date(dateTo);
    d.setHours(23, 59, 59, 999);
    range.lte = d;
  }
  const hasRange = Object.keys(range).length === 2;

  const [deposits, withdrawals] = hasRange
    ? await Promise.all([
        db.depositRequest.findMany({
          where: { createdAt: range, status: "COMPLETED" },
          include: { member: { select: { userRef: true } } },
        }),
        db.withdrawalRequest.findMany({
          where: { createdAt: range, status: "COMPLETED" },
          include: { member: { select: { userRef: true } } },
        }),
      ])
    : [[], []];

  const byUser = new Map<string, { user_id: string; deposit_total: number; deposit_count: number; withdraw_total: number; withdraw_count: number }>();
  const reportDate = hasRange && range.gte ? range.gte.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
  for (const d of deposits) {
    const u = d.member.userRef;
    if (!byUser.has(u)) byUser.set(u, { user_id: u, deposit_total: 0, deposit_count: 0, withdraw_total: 0, withdraw_count: 0 });
    const row = byUser.get(u)!;
    row.deposit_total += Number(d.amount);
    row.deposit_count += 1;
  }
  for (const w of withdrawals) {
    const u = w.member.userRef;
    if (!byUser.has(u)) byUser.set(u, { user_id: u, deposit_total: 0, deposit_count: 0, withdraw_total: 0, withdraw_count: 0 });
    const row = byUser.get(u)!;
    row.withdraw_total += Number(w.amount);
    row.withdraw_count += 1;
  }

  const rows = Array.from(byUser.values()).map((r) => ({
    report_date: reportDate,
    user_id: r.user_id,
    currency: "MYR",
    deposit_total: Math.round(r.deposit_total * 100) / 100,
    deposit_count: r.deposit_count,
    withdraw_total: Math.round(r.withdraw_total * 100) / 100,
    withdraw_count: r.withdraw_count,
    turnover_total: 0,
    payout_total: 0,
    player_net: Math.round((r.withdraw_total - r.deposit_total) * 100) / 100,
    bonus_granted_total: 0,
  }));
  const summary = rows.reduce(
    (s, r) => ({
      deposit_total: s.deposit_total + (r.deposit_total as number),
      withdraw_total: s.withdraw_total + (r.withdraw_total as number),
      turnover_total: 0,
      payout_total: 0,
      bonus_granted_total: 0,
      total_count: rows.length,
    }),
    { deposit_total: 0, withdraw_total: 0, turnover_total: 0, payout_total: 0, bonus_granted_total: 0, total_count: 0 }
  );
  return {
    report: "user_kpi",
    columns: USER_KPI_COLUMNS,
    rows,
    summary: { ...summary, deposit_total: Math.round(summary.deposit_total * 100) / 100, withdraw_total: Math.round(summary.withdraw_total * 100) / 100 },
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ reportKey: string }> }
) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { reportKey } = await params;
  const sp = req.nextUrl.searchParams;
  const wantCsv = sp.get("format") === "csv";
  const spForQuery = new URLSearchParams(sp);
  if (wantCsv) {
    spForQuery.set("pageSize", "5000");
    spForQuery.set("page", "1");
  }

  let body: ReportApiResponse;
  if (reportKey === "all-transactions") {
    body = await getAllTransactions(spForQuery);
  } else if (reportKey === "ledger-transactions") {
    body = await getLedgerTransactions(spForQuery);
  } else if (reportKey === "hourly-sales") {
    body = await getHourlySales(spForQuery);
  } else if (reportKey === "winloss-by-game") {
    body = await getWinlossByGame(spForQuery);
  } else if (reportKey === "bonus-cost") {
    body = await getBonusCost(spForQuery);
  } else if (reportKey === "user-kpi") {
    body = await getUserKpi(spForQuery);
  } else if (reportKey === "gateway-search") {
    body = await getGatewaySearch(spForQuery);
  } else if (reportKey === "reconciliation") {
    body = await getReconciliation(spForQuery);
  } else if (reportKey === "transaction-report") {
    body = await getTransactionReport(spForQuery);
  } else if (reportKey === "winloss-by-player") {
    body = await getWinlossByPlayer(spForQuery);
  } else if (reportKey === "top-referrer") {
    body = await getTopReferrers(spForQuery);
  } else if (reportKey === "promotion-report") {
    body = await getPromotionReport(spForQuery);
  } else if (reportKey === "commission") {
    body = await getCommissionReport(spForQuery);
  } else if (reportKey === "staff") {
    body = await getStaffReport(spForQuery);
  } else if (reportKey === "activity-log") {
    body = await getActivityLogReport(spForQuery);
  } else if (reportKey === "rebate-angpao") {
    body = await getRebateAngpaoReport(spForQuery);
  } else if (reportKey === "manual") {
    body = await getManualReport(spForQuery);
  } else if (reportKey === "feedback") {
    body = await getFeedbackReport(spForQuery);
  } else if (reportKey === "leaderboard") {
    body = await getLeaderboardReport(spForQuery);
  } else if (reportKey === "referrer-click") {
    body = await getReferrerClickReport(spForQuery);
  } else if (reportKey === "lucky-number") {
    body = await getLuckyNumberReport(spForQuery);
  } else if (reportKey === "lucky-draw-4d") {
    body = await getLuckyDraw4dReport(spForQuery);
  } else {
    return NextResponse.json({ error: "REPORT_NOT_FOUND", reportKey }, { status: 404 });
  }

  if (wantCsv) {
    const csv = toCsv(body);
    const filename = `${reportKey}-${new Date().toISOString().slice(0, 10)}.csv`;
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }
  return NextResponse.json(body);
}
