import "server-only";
import { prisma } from "@/server/db";

/** Ambil detail trip beserta hari dan anggota. Null bila tidak ada. */
export async function getTripDetail(tripId: string) {
  return prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      days: {
        orderBy: { order: "asc" },
        include: {
          items: {
            orderBy: [{ startTime: "asc" }, { order: "asc" }],
            include: {
              place: { select: { name: true, lat: true, lng: true } },
            },
          },
        },
      },
      members: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { joinedAt: "asc" },
      },
    },
  });
}
