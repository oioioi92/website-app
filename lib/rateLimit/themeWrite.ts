import "server-only";

import { rateLimitRedisOrMemory } from "@/lib/rateLimit/redisRateLimit";

export async function themeWriteRateLimit(adminId: string) {
  return await rateLimitRedisOrMemory({ key: `rl:theme-write:${adminId}`, limit: 10, windowSec: 60 });
}

