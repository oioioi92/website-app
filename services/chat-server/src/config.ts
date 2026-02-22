const toInt = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const splitCsv = (v: string | undefined) =>
  (v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: toInt(process.env.CHAT_SERVER_PORT, 4000),
  adminJwtSecret: process.env.CHAT_ADMIN_JWT_SECRET ?? "",
  databaseUrl: process.env.CHAT_DATABASE_URL ?? "",
  chatAllowedOrigins: splitCsv(process.env.CHAT_ALLOWED_ORIGINS),
  adminAllowedOrigins: splitCsv(process.env.ADMIN_ALLOWED_ORIGINS),
  restRatePerMinute: toInt(process.env.CHAT_REST_RATE_PER_MIN, 60),
  wsRatePerMinute: toInt(process.env.CHAT_WS_RATE_PER_MIN, 30),
  wsSessionCooldownMs: toInt(process.env.RATE_LIMIT_MS, 3000)
};

export function assertConfig() {
  if (!config.adminJwtSecret) {
    throw new Error("CHAT_ADMIN_JWT_SECRET is required");
  }
  if (!config.databaseUrl) {
    throw new Error("CHAT_DATABASE_URL is required");
  }
}

