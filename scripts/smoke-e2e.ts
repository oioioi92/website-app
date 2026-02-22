import { PrismaClient } from "@prisma/client";

const base = "http://localhost:3000";
const prisma = new PrismaClient();

type Jar = Record<string, string>;

function setCookieFromHeader(jar: Jar, raw: string) {
  const first = raw.split(";")[0];
  const idx = first.indexOf("=");
  if (idx <= 0) return;
  const key = first.slice(0, idx).trim();
  const val = first.slice(idx + 1).trim();
  jar[key] = val;
}

function applySetCookie(jar: Jar, res: Response) {
  const headersWithGetSetCookie = res.headers as Headers & { getSetCookie?: () => string[] };
  const setCookies = headersWithGetSetCookie.getSetCookie?.() ?? [];
  if (setCookies.length > 0) {
    for (const x of setCookies) setCookieFromHeader(jar, x);
    return;
  }
  const single = res.headers.get("set-cookie");
  if (single) setCookieFromHeader(jar, single);
}

function cookieHeader(jar: Jar) {
  return Object.entries(jar)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

async function req(jar: Jar, path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers ?? {});
  if (Object.keys(jar).length > 0) headers.set("cookie", cookieHeader(jar));
  const res = await fetch(`${base}${path}`, { ...init, headers });
  applySetCookie(jar, res);
  return res;
}

async function main() {
  const jar: Jar = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;

  const member = await prisma.member.upsert({
    where: { userRef: "R001" },
    create: { userRef: "R001", displayName: "Robin Test", isActive: true },
    update: { displayName: "Robin Test", isActive: true }
  });
  const provider = await prisma.gameProvider.findFirst({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
  if (!provider) throw new Error("No provider found");

  const login = await req(jar, "/api/admin/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "admin@example.com", password: "change_me_123" })
  });
  if (!login.ok) throw new Error(`Login failed: ${login.status}`);

  const csrfRes = await req(jar, "/api/admin/csrf", { method: "GET" });
  const csrfData = (await csrfRes.json()) as { token: string };
  const csrf = csrfData.token;

  const wallet = await req(jar, "/api/admin/ledger/wallet", {
    method: "POST",
    headers: { "content-type": "application/json", "x-csrf-token": csrf },
    body: JSON.stringify({
      memberId: member.id,
      type: "DEPOSIT",
      amount: 200,
      happenedAt: new Date().toISOString(),
      channel: "SMOKE",
      note: "smoke wallet tx"
    })
  });
  if (!wallet.ok) throw new Error(`Wallet create failed: ${wallet.status}`);

  const providerTx = await req(jar, "/api/admin/ledger/provider", {
    method: "POST",
    headers: { "content-type": "application/json", "x-csrf-token": csrf },
    body: JSON.stringify({
      providerId: provider.id,
      type: "CREDIT_IN",
      amount: 150,
      happenedAt: new Date().toISOString(),
      note: "smoke provider tx"
    })
  });
  if (!providerTx.ok) throw new Error(`Provider tx create failed: ${providerTx.status}`);

  const createSheet = await req(jar, "/api/admin/sheets", {
    method: "POST",
    headers: { "content-type": "application/json", "x-csrf-token": csrf },
    body: JSON.stringify({ date: todayStr })
  });
  if (!createSheet.ok) throw new Error(`Create sheet failed: ${createSheet.status}`);
  const created = (await createSheet.json()) as { id: string };

  const recalc = await req(jar, `/api/admin/sheets/${created.id}/recalc`, {
    method: "POST",
    headers: { "x-csrf-token": csrf }
  });
  if (!recalc.ok) throw new Error(`Recalc failed: ${recalc.status}`);

  const detailRes = await req(jar, `/api/admin/sheets/${created.id}`, { method: "GET" });
  if (!detailRes.ok) throw new Error(`Sheet detail failed: ${detailRes.status}`);
  const detail = (await detailRes.json()) as {
    sheet: {
      lines: Array<{ id: string; closingBalanceExpected: string; provider: { id: string; name: string } }>;
    };
  };
  const targetLine = detail.sheet.lines.find((x) => x.provider.id === provider.id) ?? detail.sheet.lines[0];
  if (!targetLine) throw new Error("No line found");
  const badActual = Number(targetLine.closingBalanceExpected) + 150;
  const lineUpdate = await req(jar, `/api/admin/sheets/${created.id}/lines/${targetLine.id}`, {
    method: "PUT",
    headers: { "content-type": "application/json", "x-csrf-token": csrf },
    body: JSON.stringify({ closingBalanceActual: badActual })
  });
  if (!lineUpdate.ok) throw new Error(`Line update failed: ${lineUpdate.status}`);

  const closeBlocked = await req(jar, `/api/admin/sheets/${created.id}/close`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-csrf-token": csrf },
    body: JSON.stringify({ allowForceClose: true, confirmForce: false, note: "" })
  });
  if (closeBlocked.status !== 403) throw new Error(`Expected 403 danger block, got ${closeBlocked.status}`);

  const forceClose = await req(jar, `/api/admin/sheets/${created.id}/close`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-csrf-token": csrf },
    body: JSON.stringify({
      allowForceClose: true,
      confirmForce: true,
      note: "Force close for smoke test"
    })
  });
  if (!forceClose.ok) throw new Error(`Force close failed: ${forceClose.status}`);

  const dashboard = await req(jar, `/api/admin/dashboard/summary?date=${todayStr}`, { method: "GET" });
  if (!dashboard.ok) throw new Error(`Dashboard failed: ${dashboard.status}`);
  const dashData = (await dashboard.json()) as {
    wallet: { count: number };
    provider: { count: number };
  };

  const exportRes = await req(jar, `/api/admin/sheets/${created.id}/export`, { method: "GET" });
  if (!exportRes.ok) throw new Error(`Export failed: ${exportRes.status}`);
  const contentType = exportRes.headers.get("content-type") ?? "";
  if (!contentType.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) {
    throw new Error(`Unexpected export content-type: ${contentType}`);
  }
  const buf = await exportRes.arrayBuffer();
  if (buf.byteLength < 1000) throw new Error(`Export file too small: ${buf.byteLength}`);

  console.log(
    JSON.stringify(
      {
        ok: true,
        today: todayStr,
        sheetId: created.id,
        dashboardWalletCount: dashData.wallet.count,
        dashboardProviderCount: dashData.provider.count,
        exportBytes: buf.byteLength
      },
      null,
      2
    )
  );
}

main()
  .catch((err) => {
    console.error("SMOKE_FAIL", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
