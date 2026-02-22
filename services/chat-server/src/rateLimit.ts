type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  if (b.count >= limit) return { ok: false, remaining: 0, retryAt: b.resetAt };
  b.count += 1;
  return { ok: true, remaining: limit - b.count };
}

type CooldownState = { nextAt: number };
const cooldown = new Map<string, CooldownState>();

export function enforceCooldown(key: string, cooldownMs: number) {
  const now = Date.now();
  const st = cooldown.get(key);
  if (!st || st.nextAt <= now) {
    cooldown.set(key, { nextAt: now + cooldownMs });
    return { ok: true };
  }
  return { ok: false, retryAt: st.nextAt };
}

