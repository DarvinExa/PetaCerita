import "server-only";
import type { Trip } from "@prisma/client";
import { prisma } from "@/server/db";
import { formatDateOnly } from "@/lib/dates";

export type TripBucket = "upcoming" | "ongoing" | "past";

export type TripCardData = Trip & {
  memberCount: number;
  dayCount: number;
  role: "OWNER" | "MEMBER";
};

export type GroupedTrips = Record<TripBucket, TripCardData[]>;

/** Klasifikasi trip relatif terhadap hari ini (perbandingan date-only UTC). */
export function classifyTrip(
  trip: Pick<Trip, "startDate" | "endDate">,
): TripBucket {
  const today = formatDateOnly(new Date());
  const start = formatDateOnly(trip.startDate);
  const end = formatDateOnly(trip.endDate);
  if (end < today) return "past";
  if (start > today) return "upcoming";
  return "ongoing";
}

/** Ambil semua trip milik/diikuti user, terkelompok untuk dashboard. */
export async function getTripsForUser(userId: string): Promise<GroupedTrips> {
  const memberships = await prisma.tripMember.findMany({
    where: { userId },
    select: {
      role: true,
      trip: {
        include: {
          _count: { select: { members: true, days: true } },
        },
      },
    },
    orderBy: { trip: { startDate: "asc" } },
  });

  const grouped: GroupedTrips = { upcoming: [], ongoing: [], past: [] };

  for (const { role, trip } of memberships) {
    const { _count, ...rest } = trip;
    const card: TripCardData = {
      ...rest,
      memberCount: _count.members,
      dayCount: _count.days,
      role,
    };
    grouped[classifyTrip(trip)].push(card);
  }

  // Past diurutkan menurun (paling baru dulu); lainnya menaik.
  grouped.past.reverse();
  return grouped;
}
