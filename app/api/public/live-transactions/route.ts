import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/net/clientIp";
import { getFeatureFlags } from "@/lib/public/featureFlags";
import { maskPhoneHead2Tail3 } from "@/lib/utils/mask";

const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 24;

/** 合并后按同一时间字段 desc 排序，再取前 8 笔（本 API 单次 query，orderBy happenedAt desc, take: 8）。 */
export type TxItem = {
  id: string;
  /** 顾客电话号码遮蔽显示，效仿参考：前2位 + ***** + 后3位，如 60*****685 */
  userRefMasked: string;
  /** 金额显示，效仿参考：RM xx.xx（无正负号） */
  amountDisplay: string;
  /** 金额数值，用于前台显示「01*****890 | 200」 */
  amountValue: number;
  happenedAt: string;
  provider?: string;
  kind: "deposit" | "withdraw";
};

type LivePayload = {
  items: TxItem[];
  deposit: TxItem[];
  withdraw: TxItem[];
  demo: boolean;
};

let cache: { payload: LivePayload; expiresAt: number } | null = null;

function formatRows(
  rows: Array<{
    id: string;
    amountSigned: { toString(): string };
    happenedAt: Date;
    channel: string | null;
    type: string;
    member: { userRef: string };
  }>
): TxItem[] {
  return rows.map((row) => {
    const kind = row.type === "WITHDRAW" ? "withdraw" : "deposit";
    const num = Number(row.amountSigned.toString());
    const abs = Math.abs(num);
    const amountDisplay = `RM ${abs.toFixed(2)}`; /* 效仿参考：仅显示 RM 金额，无正负号 */
    return {
      id: row.id,
      userRefMasked: maskPhoneHead2Tail3(row.member.userRef) || "—",
      amountDisplay,
      amountValue: Math.round(abs),
      happenedAt: row.happenedAt.toISOString(),
      provider: row.channel ?? undefined,
      kind
    };
  });
}

export async function GET(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const bucket = rateLimit(`public-live-tx:${ip}`, 120, 60 * 1000);
  if (!bucket.ok) return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });

  if (cache && cache.expiresAt > Date.now()) {
    return NextResponse.json(cache.payload);
  }

  const flags = await getFeatureFlags();
  const internal = flags.internalTestMode;
  const demoItems: TxItem[] = [
    { id: "d1", userRefMasked: "60*****685", amountDisplay: "RM 6.00", amountValue: 6, happenedAt: new Date().toISOString(), kind: "deposit" },
    { id: "d2", userRefMasked: "60*****639", amountDisplay: "RM 5.00", amountValue: 5, happenedAt: new Date().toISOString(), kind: "deposit" },
    { id: "w1", userRefMasked: "60*****112", amountDisplay: "RM 224.94", amountValue: 225, happenedAt: new Date().toISOString(), provider: "MEGA888", kind: "withdraw" },
    { id: "w2", userRefMasked: "60*****091", amountDisplay: "RM 155.44", amountValue: 155, happenedAt: new Date().toISOString(), provider: "JILI", kind: "withdraw" }
  ];
  let payload: LivePayload;
  const limitParam = req.nextUrl.searchParams.get("limit");
  const take = limitParam
    ? Math.min(MAX_LIMIT, Math.max(1, parseInt(limitParam, 10) || DEFAULT_LIMIT))
    : DEFAULT_LIMIT;
  try {
    const latestRows = await db.walletTransaction.findMany({
      where: {
        status: "COMPLETED",
        type: { in: ["DEPOSIT", "WITHDRAW"] }
      },
      orderBy: { happenedAt: "desc" },
      select: { id: true, amountSigned: true, happenedAt: true, channel: true, type: true, member: { select: { userRef: true } } },
      take
    });
    const demo = internal && latestRows.length === 0;
    const latest = formatRows(latestRows);
    const items = (demo ? demoItems : latest).slice(0, take);
    const deposit = items.filter((x) => x.kind === "deposit");
    const withdraw = items.filter((x) => x.kind === "withdraw");

    payload = {
      items,
      deposit,
      withdraw,
      demo
    };
  } catch {
    payload = {
      items: internal ? demoItems : [],
      deposit: [],
      withdraw: [],
      demo: internal
    };
  }

  cache = { payload, expiresAt: Date.now() + 45_000 };
  return NextResponse.json(payload);
}
