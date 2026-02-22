import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ReportApiResponse, ReportColumn } from "@/lib/backoffice/report-api-types";

export const dynamic = "force-dynamic";

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
  // ReportDailyGameWinloss 在 SQLite schema 中未定义，先返回空数据
  return {
    report: "winloss_by_game",
    columns: WINLOSS_BY_GAME_COLUMNS,
    rows: [],
    summary: { turnover_total: 0, payout_total: 0, platform_ggr: 0, bet_count: 0, total_count: 0 }
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

async function getUserKpi(_sp: URLSearchParams): Promise<ReportApiResponse> {
  // UserKpiDaily 在 SQLite schema 中未定义，先返回空数据
  return {
    report: "user_kpi",
    columns: USER_KPI_COLUMNS,
    rows: [],
    summary: { deposit_total: 0, withdraw_total: 0, turnover_total: 0, payout_total: 0, bonus_granted_total: 0, total_count: 0 }
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

  if (reportKey === "all-transactions") {
    const body = await getAllTransactions(sp);
    return NextResponse.json(body);
  }
  if (reportKey === "ledger-transactions") {
    const body = await getLedgerTransactions(sp);
    return NextResponse.json(body);
  }
  if (reportKey === "hourly-sales") {
    const body = await getHourlySales(sp);
    return NextResponse.json(body);
  }
  if (reportKey === "winloss-by-game") {
    const body = await getWinlossByGame(sp);
    return NextResponse.json(body);
  }
  if (reportKey === "bonus-cost") {
    const body = await getBonusCost(sp);
    return NextResponse.json(body);
  }
  if (reportKey === "user-kpi") {
    const body = await getUserKpi(sp);
    return NextResponse.json(body);
  }

  return NextResponse.json({ error: "REPORT_NOT_FOUND", reportKey }, { status: 404 });
}
