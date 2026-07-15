import "server-only";
import { randomBytes, createHash, timingSafeEqual } from "node:crypto";

/**
 * Pembuatan dan verifikasi token invite.
 *
 * Token mentah: 32 byte acak kriptografis (256 bit, jauh di atas syarat 128
 * bit) dikodekan base64url agar aman dipakai di URL. Token disimpan sebagai
 * hash SHA-256 (tokenHash) untuk jalur verifikasi/lookup saat join, sesuai
 * aturan keamanan. Baris juga menyimpan token mentah agar Owner bisa menyalin
 * ulang link dari panel (keputusan produk: link re-viewable).
 */

const TOKEN_BYTES = 32;

export function generateInviteToken(): { token: string; tokenHash: string } {
  const token = randomBytes(TOKEN_BYTES).toString("base64url");
  return { token, tokenHash: hashInviteToken(token) };
}

/** Hash token mentah menjadi hex SHA-256 untuk lookup dan penyimpanan. */
export function hashInviteToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Bandingkan dua hash hex dengan waktu konstan untuk mencegah timing attack.
 * Kedua argumen diasumsikan hex SHA-256 (panjang sama); beda panjang -> false.
 */
export function safeHashEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
