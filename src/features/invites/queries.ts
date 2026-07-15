import "server-only";
import { prisma } from "@/server/db";

export interface InviteInfo {
  token: string;
  expiresAt: Date | null;
  isExpired: boolean;
  createdAt: Date;
}

/**
 * Ambil invite aktif sebuah trip untuk panel Owner. Mengembalikan token mentah
 * agar Owner bisa menyalin ulang link (keputusan produk: link re-viewable).
 * HANYA panggil dari konteks yang sudah memverifikasi user adalah Owner.
 */
export async function getTripInvite(
  tripId: string,
): Promise<InviteInfo | null> {
  const invite = await prisma.tripInvite.findUnique({
    where: { tripId },
    select: { token: true, expiresAt: true, createdAt: true },
  });
  if (!invite) return null;

  return {
    token: invite.token,
    expiresAt: invite.expiresAt,
    isExpired: invite.expiresAt
      ? invite.expiresAt.getTime() <= Date.now()
      : false,
    createdAt: invite.createdAt,
  };
}
