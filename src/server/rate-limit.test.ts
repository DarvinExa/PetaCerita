import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { rateLimit, resetRateLimit } from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    resetRateLimit("k");
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("mengizinkan sampai batas lalu menolak", () => {
    expect(rateLimit("k", 3, 1000).ok).toBe(true);
    expect(rateLimit("k", 3, 1000).ok).toBe(true);
    expect(rateLimit("k", 3, 1000).ok).toBe(true);
    const blocked = rateLimit("k", 3, 1000);
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it("mereset setelah jendela lewat", () => {
    rateLimit("k", 1, 1000);
    expect(rateLimit("k", 1, 1000).ok).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(rateLimit("k", 1, 1000).ok).toBe(true);
  });

  it("menghitung remaining dengan benar", () => {
    expect(rateLimit("k", 5, 1000).remaining).toBe(4);
    expect(rateLimit("k", 5, 1000).remaining).toBe(3);
  });

  it("kunci berbeda terpisah", () => {
    resetRateLimit("a");
    resetRateLimit("b");
    expect(rateLimit("a", 1, 1000).ok).toBe(true);
    expect(rateLimit("b", 1, 1000).ok).toBe(true);
    expect(rateLimit("a", 1, 1000).ok).toBe(false);
  });
});
