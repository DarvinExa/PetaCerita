import { describe, it, expect } from "vitest";
import {
  generateInviteToken,
  hashInviteToken,
  safeHashEquals,
} from "./invite-token";

describe("invite-token", () => {
  it("menghasilkan token acak base64url yang panjang", () => {
    const { token } = generateInviteToken();
    // 32 byte base64url tanpa padding = 43 karakter.
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(token.length).toBeGreaterThanOrEqual(43);
  });

  it("token unik antar pemanggilan", () => {
    const a = generateInviteToken();
    const b = generateInviteToken();
    expect(a.token).not.toBe(b.token);
    expect(a.tokenHash).not.toBe(b.tokenHash);
  });

  it("tokenHash konsisten dengan hashInviteToken", () => {
    const { token, tokenHash } = generateInviteToken();
    expect(hashInviteToken(token)).toBe(tokenHash);
  });

  it("hash adalah hex SHA-256 (64 karakter)", () => {
    const { tokenHash } = generateInviteToken();
    expect(tokenHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("safeHashEquals true untuk hash sama, false untuk beda", () => {
    const { tokenHash } = generateInviteToken();
    expect(safeHashEquals(tokenHash, tokenHash)).toBe(true);
    const other = generateInviteToken().tokenHash;
    expect(safeHashEquals(tokenHash, other)).toBe(false);
  });

  it("safeHashEquals false bila panjang berbeda", () => {
    expect(safeHashEquals("abcd", "abcdef")).toBe(false);
  });
});
