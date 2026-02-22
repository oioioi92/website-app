import "server-only";

import { getRedisClient, isRedisConfigured, redisKey } from "@/lib/redis";
import { rateLimit as rateLimitMemory } from "@/lib/rate-limit";

type RateLimitResult = { ok: boolean; remaining: number; retryAt?: number; source: "redis" | "memory" | "disabled" };

// Atomic fixed-window counter: INCR + (if first) EXPIRE, in one script.
const incrExpireLua = `
local current = redis.call("INCR", KEYS[1])
if current == 1 then
  redis.call("EXPIRE", KEYS[1], tonumber(ARGV[1]))
end
local ttl = redis.call("TTL", KEYS[1])
return { current, ttl }
`;

export async function rateLimitRedisOrMemory(opts: {
  key: string; // without prefix
  limit: number;
  windowSec: number;
}): Promise<RateLimitResult> {
  // If REDIS_URL is not configured, keep existing behavior (single instance).
  if (!isRedisConfigured()) {
    const bucket = rateLimitMemory(opts.key, opts.limit, opts.windowSec * 1000);
    return { ...bucket, source: "memory" };
  }

  const client = await getRedisClient();
  if (!client) {
    // Security-first: when Redis is expected but unavailable, deny writes.
    return { ok: false, remaining: 0, retryAt: Date.now() + opts.windowSec * 1000, source: "disabled" };
  }

  const fullKey = redisKey(opts.key);
  const res = (await client.eval(incrExpireLua, {
    keys: [fullKey],
    arguments: [String(opts.windowSec)]
  })) as unknown;

  // node-redis returns unknown; normalize defensively.
  const arr = Array.isArray(res) ? res : [];
  const current = Number(arr[0] ?? 0);
  const ttl = Number(arr[1] ?? opts.windowSec);

  const resetAt = Date.now() + Math.max(0, ttl) * 1000;
  if (current > opts.limit) {
    return { ok: false, remaining: 0, retryAt: resetAt, source: "redis" };
  }
  return { ok: true, remaining: Math.max(0, opts.limit - current), retryAt: resetAt, source: "redis" };
}

