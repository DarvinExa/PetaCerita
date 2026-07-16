import type { ItineraryCategory } from "@prisma/client";

/**
 * Bentuk data papan itinerary yang aman dipakai di Client Component. Sengaja
 * dipisah dari queries.ts (yang server-only) agar bisa diimpor tanpa memuat
 * Prisma. Selaras dengan hasil getItineraryBoard.
 */

export type BoardDay = { id: string; date: Date; order: number };

export type BoardItem = {
  id: string;
  tripId: string;
  dayId: string | null;
  placeId: string;
  startTime: string | null;
  endTime: string | null;
  category: ItineraryCategory;
  note: string | null;
  estimatedCost: number | null;
  order: number;
  place: {
    id: string;
    name: string;
    category: ItineraryCategory;
    address: string | null;
    lat: number | null;
    lng: number | null;
    googleMapsUrl: string | null;
  };
};

/** id kontainer Bucket Ide (item dengan dayId null). */
export const BUCKET_ID = "bucket";

/** Kunci kontainer sebuah item: id hari, atau BUCKET_ID bila di Bucket. */
export function containerOf(dayId: string | null): string {
  return dayId ?? BUCKET_ID;
}
