import "server-only";
import type { TripMember, TripRole } from "@prisma/client";
import { prisma } from "@/server/db";
import { requireUser } from "@/server/auth";

/**
 * Prisma terhubung sebagai role postgres sehingga MELEWATI RLS. Karena itu
 * seluruh cek izin trip dilakukan di lapisan aplikasi lewat helper ini.
 * Semua Server Action yang menyentuh data trip harus lewat sini dulu.
 */

/** Error izin; dipetakan ke pesan ramah di Server Action. */
export class PermissionError extends Error {
  constructor(message = "Kamu tidak punya akses ke trip ini") {
    super(message);
    this.name = "PermissionError";
  }
}

/**
 * Pastikan user saat ini anggota trip. Kembalikan baris keanggotaannya
 * (termasuk role) agar pemanggil bisa cek lebih lanjut bila perlu.
 */
export async function requireTripMember(tripId: string): Promise<TripMember> {
  const user = await requireUser();
  const membership = await prisma.tripMember.findUnique({
    where: { tripId_userId: { tripId, userId: user.id } },
  });
  if (!membership) {
    throw new PermissionError();
  }
  return membership;
}

/** Pastikan user saat ini Owner trip. */
export async function requireTripOwner(tripId: string): Promise<TripMember> {
  const membership = await requireTripMember(tripId);
  if (membership.role !== ("OWNER" satisfies TripRole)) {
    throw new PermissionError("Hanya Owner yang bisa melakukan aksi ini");
  }
  return membership;
}
