import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  CalendarBlank,
  UsersThree,
  MapTrifold,
  Receipt,
  Clock,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import { requireTripMember, PermissionError } from "@/server/permissions";
import { getTripDetail } from "@/features/trips/trip-detail-queries";
import { getTripInvite } from "@/features/invites/queries";
import { InvitePanel } from "@/features/invites/invite-panel";
import { MemberList, type MemberRow } from "@/features/invites/member-list";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateRange } from "@/lib/dates";
import { TravelCardButton } from "@/features/trips/travel-card";
import type { TravelCardData } from "@/features/trips/travel-card-data";

/** Bangun origin absolut dari header request untuk URL undangan. */
async function getBaseUrl(): Promise<string> {
  const headerList = await headers();
  const origin = headerList.get("origin");
  if (origin) return origin;
  const host = headerList.get("host") ?? "localhost:3000";
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;

  // Cek izin di lapisan aplikasi (Prisma bypass RLS).
  let membership;
  try {
    membership = await requireTripMember(tripId);
  } catch (err) {
    if (err instanceof PermissionError) notFound();
    throw err;
  }

  const trip = await getTripDetail(tripId);
  if (!trip) notFound();

  const isOwner = membership.role === "OWNER";
  const [invite, baseUrl] = await Promise.all([
    isOwner ? getTripInvite(tripId) : Promise.resolve(null),
    getBaseUrl(),
  ]);

  const memberRows: MemberRow[] = trip.members.map((m) => ({
    id: m.id,
    name: m.user.name,
    role: m.role,
    isSelf: m.userId === membership.userId,
  }));

  const dayFmt = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
  const travelCardData: TravelCardData = {
    tripName: trip.name,
    city: trip.city,
    dateRange: formatDateRange(trip.startDate, trip.endDate),
    dayCount: trip.days.length,
    memberNames: trip.members.map((member) => member.user.name),
    destinationNames: trip.days.flatMap((day) =>
      day.items.map((item) => item.place.name),
    ),
    baseCurrency: trip.baseCurrency,
    routeDays: trip.days.map((day, index) => ({
      day: index + 1,
      points: day.items
        .filter((item) => item.place.lat !== null && item.place.lng !== null)
        .map((item) => ({
          lat: item.place.lat as number,
          lng: item.place.lng as number,
        })),
    })),
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-8 sm:py-10">
      <Link
        href="/dashboard"
        className="mb-4 inline-flex min-h-11 items-center gap-1.5 doodle-sticker text-[13px] text-neutral-600 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
      >
        <ArrowLeft className="size-4" aria-hidden />
        <span>Kembali ke dashboard</span>
      </Link>

      <section className="relative mb-8 overflow-hidden doodle-box border border-teal-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,118,110,0.08)] sm:p-7">
        <span
          className="absolute inset-y-0 left-0 w-1.5 bg-teal-700"
          aria-hidden
        />
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-teal-700">
              Ruang perjalanan
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-[-0.02em] text-neutral-900 sm:text-[30px]">
              {trip.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-neutral-600">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4 text-neutral-400" aria-hidden />
                {trip.city}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarBlank
                  className="size-4 text-neutral-400"
                  aria-hidden
                />
                {formatDateRange(trip.startDate, trip.endDate)}
              </span>
              <Badge variant="neutral">{trip.baseCurrency}</Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <TravelCardButton data={travelCardData} />
            <Button asChild variant="primary" size="md">
              <Link href={`/trips/${tripId}/itinerary`}>
                <MapTrifold className="size-5" aria-hidden />
                <span>Susun itinerary</span>
              </Link>
            </Button>
            <Button asChild variant="secondary" size="md">
              <Link href={`/trips/${tripId}/bill`}>
                <Receipt className="size-5" aria-hidden />
                <span>Budget dan bill</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-neutral-600">
            Rencana harian ({trip.days.length} hari)
          </h2>
          <Link
            href={`/trips/${tripId}/itinerary`}
            className="inline-flex min-h-11 items-center gap-1 doodle-sticker text-[13px] font-semibold text-teal-700 hover:text-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            Buka jadwal lengkap
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="flex flex-col gap-4">
          {trip.days.map((day, index) => (
            <Card key={day.id} className="overflow-hidden p-0">
              <div className="flex items-center justify-between gap-4 border-b border-white/70 bg-neutral-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center doodle-sticker bg-teal-800 text-[12px] font-bold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-teal-700">
                      Hari {index + 1}
                    </p>
                    <p className="text-[14px] font-semibold text-neutral-900">
                      {dayFmt.format(day.date)}
                    </p>
                  </div>
                </div>
                <span className="text-[12px] font-medium text-neutral-500">
                  {day.items.length} tempat
                </span>
              </div>
              {day.items.length > 0 ? (
                <div className="divide-y divide-neutral-100">
                  {day.items.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[72px_1fr] items-center gap-3 px-4 py-3"
                    >
                      <span className="inline-flex items-center gap-1 text-[12px] font-semibold tabular-nums text-neutral-500">
                        <Clock
                          className="size-3.5 text-neutral-400"
                          aria-hidden
                        />
                        {item.startTime ?? "Belum"}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-medium text-neutral-900">
                          {item.place.name}
                        </p>
                        {item.endTime ? (
                          <p className="text-[12px] text-neutral-500">
                            Selesai {item.endTime}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                  {day.items.length > 4 ? (
                    <p className="px-4 py-2.5 text-[12px] font-medium text-teal-700">
                      +{day.items.length - 4} tempat lainnya
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="px-4 py-5 text-[13px] text-neutral-500">
                  Belum ada tempat untuk hari ini.
                </p>
              )}
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-8 flex flex-col gap-3">
        <h2 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-neutral-500">
          <UsersThree className="size-4" aria-hidden />
          Anggota ({memberRows.length})
        </h2>

        {isOwner ? (
          <Card className="bg-white p-4">
            <h3 className="text-[15px] font-semibold text-neutral-900">
              Undang teman
            </h3>
            <p className="mt-0.5 mb-4 text-[13px] text-neutral-600">
              Bagikan link ini. Siapa pun yang buka lalu masuk otomatis jadi
              anggota trip.
            </p>
            <InvitePanel tripId={tripId} invite={invite} baseUrl={baseUrl} />
          </Card>
        ) : null}

        <MemberList tripId={tripId} members={memberRows} canManage={isOwner} />
      </section>
    </div>
  );
}
