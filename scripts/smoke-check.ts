import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const base = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const adminEmail = process.env.SMOKE_ADMIN_EMAIL ?? "admin@example.com";
const adminPassword = process.env.SMOKE_ADMIN_PASSWORD ?? "change_me_123";

type CookieJar = Record<string, string>;

function setCookieFromHeader(jar: CookieJar, raw: string) {
  const first = raw.split(";")[0];
  const eq = first.indexOf("=");
  if (eq <= 0) return;
  jar[first.slice(0, eq).trim()] = first.slice(eq + 1).trim();
}

function applySetCookie(jar: CookieJar, res: Response) {
  const h = res.headers as Headers & { getSetCookie?: () => string[] };
  const list = h.getSetCookie?.() ?? [];
  if (list.length > 0) {
    for (const item of list) setCookieFromHeader(jar, item);
    return;
  }
  const one = res.headers.get("set-cookie");
  if (one) setCookieFromHeader(jar, one);
}

function toCookieHeader(jar: CookieJar) {
  return Object.entries(jar)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

async function call(jar: CookieJar, path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers ?? {});
  if (Object.keys(jar).length > 0) headers.set("cookie", toCookieHeader(jar));
  const res = await fetch(`${base}${path}`, { ...init, headers });
  applySetCookie(jar, res);
  return res;
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const jar: CookieJar = {};

  const promo = await prisma.promotion.findFirst({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true }
  });
  const sheet = await prisma.reconcileSheet.findFirst({
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    select: { id: true }
  });
  assert(promo?.id, "No promotion found. Run `npm run seed:test` first.");
  assert(sheet?.id, "No sheet found. Run `npm run seed:test` first.");

  const loginRes = await call(jar, "/api/admin/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: adminEmail, password: adminPassword })
  });
  assert(loginRes.ok, `Admin login failed: ${loginRes.status}`);

  const healthRes = await call(jar, "/api/admin/test/health");
  assert(healthRes.ok, `Health check failed: ${healthRes.status}`);
  const healthJson = (await healthRes.json()) as {
    ok?: boolean;
    env?: { internalTestMode?: boolean };
    counts?: { promotions?: number; sheets?: number };
  };
  assert(healthJson.ok === true, "Health payload invalid: ok != true");
  assert(healthJson.env?.internalTestMode === true, "INTERNAL_TEST_MODE is off");

  const day = new Date();
  const dayStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;

  const dashRes = await call(jar, `/api/admin/dashboard/summary?date=${dayStr}`);
  assert(dashRes.ok, `Dashboard summary failed: ${dashRes.status}`);
  const dashJson = (await dashRes.json()) as { wallet?: unknown; provider?: unknown; risks?: unknown };
  assert(dashJson.wallet && dashJson.provider && dashJson.risks, "Dashboard payload missing keys");

  const statsRes = await call(jar, `/api/admin/promotions/${promo.id}/stats?from=${dayStr}&to=${dayStr}`);
  assert(statsRes.ok, `Promotion stats failed: ${statsRes.status}`);
  const statsJson = (await statsRes.json()) as { totalClaims?: number; byDay?: unknown[] };
  assert(typeof statsJson.totalClaims === "number", "Promotion stats payload invalid");
  assert(Array.isArray(statsJson.byDay), "Promotion stats byDay missing");

  const sheetRes = await call(jar, `/api/admin/sheets/${sheet.id}`);
  assert(sheetRes.ok, `Sheet detail failed: ${sheetRes.status}`);
  const sheetJson = (await sheetRes.json()) as { sheet?: { id?: string; lines?: unknown[] } };
  assert(sheetJson.sheet?.id === sheet.id, "Sheet payload invalid");

  const exportRes = await call(jar, `/api/admin/sheets/${sheet.id}/export`);
  assert(exportRes.ok, `Sheet export failed: ${exportRes.status}`);
  const exportType = exportRes.headers.get("content-type") ?? "";
  assert(
    exportType.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
    `Invalid export content-type: ${exportType}`
  );

  const publicJar: CookieJar = {};
  const sessionRes = await call(publicJar, "/api/public/member/session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ userRef: "R001", displayName: "Robin Smoke" })
  });
  assert(sessionRes.ok, `Public member session failed: ${sessionRes.status}`);

  const previewRes = await call(publicJar, `/api/public/promotions/${promo.id}/claim/preview`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ baseAmount: 10 })
  });
  assert(previewRes.ok, `Public claim preview failed: ${previewRes.status}`);
  const previewJson = (await previewRes.json()) as { ok?: boolean; reason?: string };
  assert(typeof previewJson.ok === "boolean", "Public claim preview payload invalid");
  assert(typeof previewJson.reason === "string", "Public claim preview reason missing");

  console.log("SMOKE_OK: health=ok dash=ok promoStats=ok sheet=ok export=ok publicClaim=ok");
}

main()
  .catch((err) => {
    console.error("SMOKE_FAIL:", err instanceof Error ? err.message : String(err));
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
