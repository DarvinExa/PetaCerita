import "server-only";
import { prisma } from "@/server/db";

/**
 * Ambil seluruh data papan itinerary sebuah trip: daftar hari, semua item
 * (baik yang di Bucket maupun terjadwal), lengkap dengan tempatnya. Data
 * dibentuk agar client tinggal mengelompokkan per kontainer.
 *
 * Pemanggil wajib sudah memverifikasi keanggotaan trip (requireTripMember),
 * karena Prisma melewati RLS.
 */
export async function getItineraryBoard(tripId: string) {
  const [days, items] = await Promise.all([
    prisma.day.findMany({
      where: { tripId },
      orderBy: { order: "asc" },
      select: { id: true, date: true, order: true },
    }),
    prisma.itineraryItem.findMany({
      where: { tripId },
      orderBy: { order: "asc" },
      include: {
        place: {
          select: {
            id: true,
            name: true,
            category: true,
            address: true,
            lat: true,
            lng: true,
            googleMapsUrl: true,
          },
        },
      },
    }),
  ]);

  return { days, items };
}

export type ItineraryBoard = Awaited<ReturnType<typeof getItineraryBoard>>;
export type ItineraryItemWithPlace = ItineraryBoard["items"][number];
