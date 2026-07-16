"use client";

import { useTripRealtime } from "./use-trip-realtime";
import type { TripChangeScope } from "@/server/realtime";

/**
 * Komponen mount tanpa tampilan untuk berlangganan nudge realtime sebuah trip.
 * Dipakai oleh Server Component (mis. halaman bill) yang tidak bisa memanggil
 * hook langsung. Client Component boleh memakai useTripRealtime langsung.
 */
export function TripRealtime({
  tripId,
  scope,
}: {
  tripId: string;
  scope?: TripChangeScope;
}) {
  useTripRealtime(tripId, scope);
  return null;
}
