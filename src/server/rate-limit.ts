import "server-only";

/**
 * Rate limiter fixed-window sederhana berbasis memori proses.
 *
 * Cukup untuk membatasi brute force token invite dan aksi sensitif pada satu
 * instance. Untuk produksi multi-instance, ganti dengan store bersama seperti
 * Upstash Redis. Sengaja tanpa dependency berat untuk menjaga kesederhanaan.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterMs: number;
}

/**
 * Catat satu percobaan untuk `key`. Mengembalikan ok=false bila kuota dalam
 * jendela `windowMs` sudah habis. Membersihkan bucket kedaluwarsa secara lazy.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterMs: 0 };
  }

  if (existing.count >= limit) {
    return { ok: false, remaining: 0, retryAfterMs: existing.resetAt - now };
  }

  existing.count += 1;
  return {
    ok: true,
    remaining: limit - existing.count,
    retryAfterMs: existing.resetAt - now,
  };
}

/** Reset satu key. Dipakai di test untuk isolasi antar kasus. */
export function resetRateLimit(key: string): void {
  buckets.delete(key);
}
