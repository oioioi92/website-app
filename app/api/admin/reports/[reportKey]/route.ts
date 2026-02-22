import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** 各报表的模拟数据，仅用于前端展示模块效果；对接真实 API 后移除此处返回，改为查库或调外部接口 */
const MOCK_DATA: Record<string, Record<string, unknown>[]> = {
  "win-lose": [
    { agentId: "AG001", stake: "15,200.00", validRollover: "15,200.00", winLose: "-1,080.00", count: "156" },
    { agentId: "AG001", stake: "8,500.00", validRollover: "8,500.00", winLose: "420.00", count: "89" },
    { agentId: "AG002", stake: "22,100.00", validRollover: "22,100.00", winLose: "1,650.00", count: "203" },
    { agentId: "AG001", stake: "12,800.00", validRollover: "12,800.00", winLose: "-320.00", count: "142" }
  ],
  "win-lose-by-games": [
    { game: "Slot A", stake: "28,000.00", winLose: "-1,400.00", count: "298" },
    { game: "Live Baccarat", stake: "18,500.00", winLose: "920.00", count: "178" },
    { game: "Sport X", stake: "35,200.00", winLose: "2,100.00", count: "312" }
  ],
  "wallet-transfer": [
    { time: "2025-02-21 10:45:22", userId: "U1001", type: "IN", amount: "500.00", status: "COMPLETED" },
    { time: "2025-02-21 10:12:08", userId: "U1002", type: "OUT", amount: "200.00", status: "COMPLETED" },
    { time: "2025-02-21 09:58:33", userId: "U1003", type: "IN", amount: "1,000.00", status: "COMPLETED" }
  ],
  "game-logs": [
    { time: "2025-02-21 10:44:01", userId: "U1001", game: "Slot A", action: "BET", detail: "stake 50.00" },
    { time: "2025-02-21 10:43:58", userId: "U1001", game: "Slot A", action: "SPIN", detail: "round R8821" },
    { time: "2025-02-21 10:42:15", userId: "U1002", game: "Live Baccarat", action: "JOIN", detail: "table T02" }
  ],
  sales: [
    { date: "2025-02-21", channel: "Web", amount: "45,600.00", count: "328" },
    { date: "2025-02-21", channel: "Cash", amount: "12,300.00", count: "56" },
    { date: "2025-02-20", channel: "Web", amount: "38,200.00", count: "291" }
  ],
  "sales-cash-web": [
    { date: "2025-02-21", channel: "Cash Web", amount: "8,900.00", count: "42" },
    { date: "2025-02-20", channel: "Cash Web", amount: "7,200.00", count: "38" }
  ],
  "sales-graph": [
    { date: "2025-02-21", channel: "Web", amount: "45,600.00", count: "328" },
    { date: "2025-02-20", channel: "Web", amount: "38,200.00", count: "291" },
    { date: "2025-02-19", channel: "Web", amount: "41,100.00", count: "305" }
  ],
  transactions: [
    { time: "2025-02-21 10:45:22", userId: "U1001", type: "DEPOSIT", amount: "500.00", status: "COMPLETED" },
    { time: "2025-02-21 10:12:08", userId: "U1002", type: "WITHDRAW", amount: "200.00", status: "COMPLETED" },
    { time: "2025-02-21 09:58:33", userId: "U1003", type: "BET", amount: "100.00", status: "COMPLETED" }
  ],
  "promotion-claim": [
    { time: "2025-02-21 10:30:00", userId: "U1001", promo: "首存礼金", amount: "88.00", status: "CLAIMED" },
    { time: "2025-02-21 09:15:00", userId: "U1002", promo: "每日返水", amount: "25.50", status: "CLAIMED" }
  ]
};

/** Win Lose By Games 点击 provider 后的游戏明细（按 providerId 查） */
const MOCK_GAMES_BY_PROVIDER: Record<string, Record<string, unknown>[]> = {
  "918Kiss1": [
    { gameName: "DolphinReef", validRollover: "14.80", stake: "14.80", winLose: "-10.72" },
    { gameName: "GreatBlue", validRollover: "308.56", stake: "308.56", winLose: "-40.00" },
    { gameName: "SeaWorld", validRollover: "12.25", stake: "12.25", winLose: "-9.25" }
  ],
  "JDB1": [
    { gameName: "Lucky Phoenix", validRollover: "520.00", stake: "520.00", winLose: "38.00" },
    { gameName: "Dragon Legend", validRollover: "760.00", stake: "760.00", winLose: "82.00" }
  ],
  "Jili1": [
    { gameName: "Golden Empire", validRollover: "1,200.00", stake: "1,200.00", winLose: "-50.00" },
    { gameName: "Buffalo King", validRollover: "900.00", stake: "900.00", winLose: "-35.00" }
  ],
  "Mega888": [
    { gameName: "Panther Moon", validRollover: "450.00", stake: "450.00", winLose: "25.00" },
    { gameName: "Monkey King", validRollover: "440.00", stake: "440.00", winLose: "20.00" }
  ]
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ reportKey: string }> }
) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { reportKey } = await params;
  const sp = req.nextUrl.searchParams;
  const provider = sp.get("provider");

  if (reportKey === "win-lose-by-games" && provider) {
    const items = MOCK_GAMES_BY_PROVIDER[provider] ?? [];
    return NextResponse.json({ items, total: items.length });
  }

  const items = MOCK_DATA[reportKey] ?? [];
  return NextResponse.json({ items, total: items.length });
}
