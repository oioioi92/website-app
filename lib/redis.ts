import "server-only";

import { createClient } from "redis";

type RedisClient = ReturnType<typeof createClient>;

function envTrim(name: string) {
  const v = process.env[name];
  return typeof v === "string" ? v.trim() : "";
}

export function redisPrefix() {
  const raw = envTrim("REDIS_PREFIX");
  return raw.length ? raw : "website";
}

export function isRedisConfigured() {
  return envTrim("REDIS_URL").length > 0;
}

let client: RedisClient | null = null;
let clientPromise: Promise<RedisClient> | null = null;
let nextRetryAt = 0;
let loggedOk = false;
let lastErr: string | null = null;

export async function getRedisClient(): Promise<RedisClient | null> {
  const url = envTrim("REDIS_URL");
  if (!url) return null;

  // Basic backoff if Redis is temporarily down.
  if (Date.now() < nextRetryAt) return null;

  if (client) return client;
  if (clientPromise) return clientPromise;

  clientPromise = (async () => {
    const c = createClient({ url });

    c.on("error", (e) => {
      lastErr = e instanceof Error ? e.message : String(e);
      // Avoid noisy logs in prod.
      if ((process.env.REDIS_DEBUG ?? "0") === "1") {
        console.log(`REDIS_ERROR prefix=${redisPrefix()} msg=${lastErr}`);
      }
    });

    try {
      await c.connect();
      client = c;
      if (!loggedOk) {
        loggedOk = true;
        console.log(`REDIS_OK prefix=${redisPrefix()}`);
      }
      return c;
    } catch (e) {
      lastErr = e instanceof Error ? e.message : String(e);
      nextRetryAt = Date.now() + 5_000;
      try {
        await c.quit();
      } catch {
        // ignore
      }
      throw e;
    } finally {
      clientPromise = null;
    }
  })();

  try {
    return await clientPromise;
  } catch {
    return null;
  }
}

export function lastRedisError() {
  return lastErr;
}

export function redisKey(suffix: string) {
  const p = redisPrefix();
  const clean = suffix.startsWith(":") ? suffix.slice(1) : suffix;
  return `${p}:${clean}`;
}

