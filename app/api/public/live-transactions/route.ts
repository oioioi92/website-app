import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { maskPhoneTail4 } from "@/lib/utils/mask";
import { getClientIp } from "@/lib/net/clientIp";
import { getFeatureFlags } from "@/lib/public/featureFlags";

const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 24;

/** 合并后按同一时间字段 desc 排序，再取前 8 笔（本 API 单次 query，orderBy happenedAt desc, take: 8）。 */
export type TxItem = {
  id: string;
  userRefMasked: string;
  /** 当前全站 RM；若未来多币种可改为 amount + currency，由前端 format */
  amountDisplay: string;
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
    const abs = Math.abs(num).toFixed(2);
    const amountDisplay = kind === "deposit" ? `+ RM ${abs}` : `- RM ${abs}`; /* withdraw/rolling 一律 - */
    return {
      id: row.id,
      userRefMasked: maskPhoneTail4(row.member.userRef),
      amountDisplay,
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
    { id: "d1", userRefMasked: "*******1293", amountDisplay: "+ RM 188.00", happenedAt: new Date().toISOString(), kind: "deposit" },
    { id: "d2", userRefMasked: "*******1110", amountDisplay: "+ RM 320.00", happenedAt: new Date().toISOString(), kind: "deposit" },
    { id: "w1", userRefMasked: "*******1903", amountDisplay: "- RM 120.00", happenedAt: new Date().toISOString(), provider: "BANK", kind: "withdraw" },
    { id: "w2", userRefMasked: "*******1042", amountDisplay: "- RM 88.00", happenedAt: new Date().toISOString(), provider: "BANK", kind: "withdraw" }
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
