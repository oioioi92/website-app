type CachePayload = {
  promotions: unknown[];
  games: unknown[];
  social: unknown[];
  generatedAt: string;
};

let cache: { expiresAt: number; payload: CachePayload } | null = null;
let lastGood: CachePayload | null = null;

export function getHomeCache(): CachePayload | null {
  if (!cache) return null;
  if (cache.expiresAt <= Date.now()) return null;
  return cache.payload;
}

export function setHomeCache(payload: CachePayload, ttlSeconds: number) {
  cache = {
    payload,
    expiresAt: Date.now() + ttlSeconds * 1000
  };
  lastGood = payload;
}

export function getLastGoodHomeCache() {
  return lastGood;
}

/** 后台更新活动/主题后调用，清空首页缓存使新数据立即展示 */
export function invalidateHomeCache() {
  cache = null;
}
