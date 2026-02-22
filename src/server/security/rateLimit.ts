type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type RateLimitStore = Map<string, RateLimitBucket>;

type RateLimitGlobal = typeof globalThis & {
  __metamapRateLimitStore?: RateLimitStore;
};

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
  resetAt: number;
}

const getRateLimitStore = () => {
  const scope = globalThis as RateLimitGlobal;
  if (!scope.__metamapRateLimitStore) {
    scope.__metamapRateLimitStore = new Map<string, RateLimitBucket>();
  }
  return scope.__metamapRateLimitStore;
};

export const applyRateLimit = ({
  key,
  maxRequests,
  windowMs,
}: {
  key: string;
  maxRequests: number;
  windowMs: number;
}): RateLimitResult => {
  const now = Date.now();
  const store = getRateLimitStore();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      limit: maxRequests,
      remaining: Math.max(maxRequests - 1, 0),
      retryAfterSeconds: Math.ceil(windowMs / 1000),
      resetAt,
    };
  }

  existing.count += 1;
  const remaining = Math.max(maxRequests - existing.count, 0);
  const retryAfterSeconds = Math.max(Math.ceil((existing.resetAt - now) / 1000), 1);
  const allowed = existing.count <= maxRequests;

  return {
    allowed,
    limit: maxRequests,
    remaining,
    retryAfterSeconds,
    resetAt: existing.resetAt,
  };
};
