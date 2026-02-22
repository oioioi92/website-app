import "server-only";

import { db } from "@/lib/db";
import { getRedisClient, isRedisConfigured, redisKey } from "@/lib/redis";

const THEME_KEY = "default";
const REDIS_THEME_KEY = "theme:default";

type ThemeCacheValue = {
  themeJson: unknown;
  source: "theme" | "sitesetting";
  version?: number;
};

let cache: { expiresAt: number; value: ThemeCacheValue } | null = null;

function ttlSeconds() {
  const raw = (process.env.THEME_CACHE_TTL_SEC ?? "60").trim();
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.min(Math.max(n, 1), 3600) : 60;
}

function debugEnabled() {
  return (process.env.THEME_CACHE_DEBUG ?? "0") === "1";
}

function logOnce() {
  const g = globalThis as unknown as { __THEME_READ_MODE_LOGGED__?: boolean };
  if (g.__THEME_READ_MODE_LOGGED__) return;
  g.__THEME_READ_MODE_LOGGED__ = true;
  const backend = isRedisConfigured() ? "redis" : "memory";
  console.log(
    `THEME_READ_MODE_READY default=Theme cache_ttl=${ttlSeconds()}s cache_backend=${backend} fallback=SiteSetting`
  );
}

export async function invalidateThemeCache() {
  cache = null;
  if (!isRedisConfigured()) return;
  const client = await getRedisClient();
  if (!client) return;
  try {
    await client.del(redisKey(REDIS_THEME_KEY));
  } catch {
    // best-effort
  }
}

export async function getThemeJsonCached(): Promise<ThemeCacheValue> {
  logOnce();

  // When Redis is configured, do NOT keep per-instance memory cache,
  // otherwise invalidation won't be immediate across instances.
  const useLocalCache = !isRedisConfigured();
  if (useLocalCache && cache && cache.expiresAt > Date.now()) return cache.value;

  const ttlMs = ttlSeconds() * 1000;
  const startedAt = Date.now();

  if (isRedisConfigured()) {
    const client = await getRedisClient();
    if (client) {
      try {
        const raw = await client.get(redisKey(REDIS_THEME_KEY));
        if (raw) {
          const parsed = JSON.parse(raw) as ThemeCacheValue;
          if (parsed && typeof parsed === "object" && "themeJson" in parsed && "source" in parsed) {
            if (debugEnabled()) console.log(`THEME_CACHE_HIT source=${parsed.source} ms=${Date.now() - startedAt}`);
            return parsed;
          }
        }
      } catch (e) {
        if (debugEnabled()) console.log(`THEME_CACHE_REDIS_GET_FAIL error=${e instanceof Error ? e.message : String(e)}`);
      }
    }
  }

  try {
    const theme = await db.theme.findUnique({
      where: { key: THEME_KEY },
      select: { version: true, themeJson: true, updatedAt: true }
    });
    if (theme) {
      const value: ThemeCacheValue = { themeJson: theme.themeJson, source: "theme", version: theme.version };
      if (useLocalCache) cache = { value, expiresAt: Date.now() + ttlMs };
      if (isRedisConfigured()) {
        const client = await getRedisClient();
        if (client) {
          try {
            await client.set(redisKey(REDIS_THEME_KEY), JSON.stringify(value), { EX: ttlSeconds() });
          } catch {
            // best-effort
          }
        }
      }
      if (debugEnabled()) console.log(`THEME_CACHE_MISS source=theme version=${theme.version} ms=${Date.now() - startedAt}`);
      return value;
    }
  } catch (e) {
    if (debugEnabled()) console.log(`THEME_CACHE_MISS source=theme error=${e instanceof Error ? e.message : String(e)}`);
  }

  try {
    const row = await db.siteSetting.findUnique({ where: { key: "theme_json" }, select: { valueJson: true, updatedAt: true } });
    const value: ThemeCacheValue = { themeJson: row?.valueJson ?? null, source: "sitesetting" };
    if (useLocalCache) cache = { value, expiresAt: Date.now() + ttlMs };
    if (isRedisConfigured()) {
      const client = await getRedisClient();
      if (client) {
        try {
          await client.set(redisKey(REDIS_THEME_KEY), JSON.stringify(value), { EX: ttlSeconds() });
        } catch {
          // best-effort
        }
      }
    }
    if (debugEnabled()) console.log(`THEME_CACHE_MISS source=sitesetting ms=${Date.now() - startedAt}`);
    return value;
  } catch (e) {
    if (debugEnabled()) console.log(`THEME_CACHE_FAIL source=sitesetting error=${e instanceof Error ? e.message : String(e)}`);
    // DB unavailable: still return safe fallback.
    return { themeJson: null, source: "sitesetting" };
  }
}

