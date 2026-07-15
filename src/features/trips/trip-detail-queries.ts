import "server-only";
import { prisma } from "@/server/db";

/** Ambil detail trip beserta hari dan anggota. Null bila tidak ada. */
export async function getTripDetail(tripId: string) {
  return prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      days: { orderBy: { order: "asc" } },
      members: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { joinedAt: "asc" },
      },
    },
  });
}
