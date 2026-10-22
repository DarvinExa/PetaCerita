import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { requireTripMember, PermissionError } from "@/server/permissions";
import { getTripDetail } from "@/features/trips/trip-detail-queries";
import { getItineraryBoard } from "@/features/itinerary/queries";
import { ItineraryBoard } from "@/features/itinerary/itinerary-board";
import type { BoardItem } from "@/features/itinerary/types";

export default async function ItineraryPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;

  // Cek izin di lapisan aplikasi (Prisma bypass RLS).
  try {
    await requireTripMember(tripId);
  } catch (err) {
    if (err instanceof PermissionError) notFound();
    throw err;
  }

  const [trip, board] = await Promise.all([
    getTripDetail(tripId),
    getItineraryBoard(tripId),
  ]);
  if (!trip) notFound();

  // Normalisasi ke bentuk BoardItem yang aman untuk Client Component.
  const items: BoardItem[] = board.items.map((item) => ({
    id: item.id,
    tripId: item.tripId,
    dayId: item.dayId,
    placeId: item.placeId,
    startTime: item.startTime,
    endTime: item.endTime,
    category: item.category,
    note: item.note,
    estimatedCost: item.estimatedCost,
    order: item.order,
    place: {
      id: item.place.id,
      name: item.place.name,
      category: item.place.category,
      address: item.place.address,
      lat: item.place.lat,
      lng: item.place.lng,
      googleMapsUrl: item.place.googleMapsUrl,
    },
  }));

  return (
    <div className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-8 sm:py-10">
      <Link
        href={`/trips/${tripId}`}
        className="mb-5 inline-flex min-h-10 items-center gap-2 px-5 py-2 rounded-full clay-card text-[13px] font-bold text-slate-700 shadow-sm hover:text-teal-900 hover:shadow-md transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
      >
        <ArrowLeft className="size-4" weight="bold" aria-hidden />
        <span>Kembali ke trip</span>
      </Link>

      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-neutral-900 sm:text-3xl">
            Itinerary
          </h1>
          <p className="mt-1 text-[14px] font-semibold text-teal-700">
            {trip.name}
          </p>
        </div>
      </div>

      <ItineraryBoard
        tripId={tripId}
        currency={trip.baseCurrency}
        days={board.days}
        items={items}
      />
    </div>
  );
}
