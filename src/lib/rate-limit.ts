/**
 * 进程内固定窗口限流。Serverless 下每个实例各算各的，只能挡住单点刷量，
 * 需要严格限流时应换成 Redis/Upstash 之类的共享存储。
 */
export function createRateLimiter(options: { limit: number; windowMs: number; maxKeys?: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  const maxKeys = options.maxKeys ?? 5000;

  return function check(key: string, now = Date.now()): { ok: boolean; retryAfterSeconds: number } {
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      if (hits.size >= maxKeys) {
        for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
        if (hits.size >= maxKeys) hits.delete(hits.keys().next().value as string);
      }
      hits.set(key, { count: 1, resetAt: now + options.windowMs });
      return { ok: true, retryAfterSeconds: 0 };
    }
    entry.count += 1;
    if (entry.count > options.limit) {
      return { ok: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
    }
    return { ok: true, retryAfterSeconds: 0 };
  };
}

export function clientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
}
