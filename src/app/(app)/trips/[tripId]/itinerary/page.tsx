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
        className="mb-4 inline-flex min-h-11 items-center gap-1.5 rounded-md text-[13px] text-neutral-600 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
      >
        <ArrowLeft className="size-4" aria-hidden />
        <span>Kembali ke trip</span>
      </Link>

      <div className="mb-6 border-l-4 border-teal-700 pl-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-teal-700">
          Penyusun perjalanan
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-[-0.02em] text-neutral-900">
          Itinerary
        </h1>
        <p className="mt-1 text-[14px] text-neutral-600">
          {trip.name} - kumpulkan ide, pilih harinya, lalu susun urutan
          kunjungan dengan lebih ringkas.
        </p>
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
