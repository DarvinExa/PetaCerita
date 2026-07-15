import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  CalendarBlank,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import { requireTripMember, PermissionError } from "@/server/permissions";
import { getTripDetail } from "@/features/trips/trip-detail-queries";
import { getTripInvite } from "@/features/invites/queries";
import { InvitePanel } from "@/features/invites/invite-panel";
import { MemberList, type MemberRow } from "@/features/invites/member-list";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateRange } from "@/lib/dates";

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

  return (
    <div className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-8">
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-neutral-600 hover:text-neutral-900"
      >
        <ArrowLeft className="size-4" aria-hidden />
        <span>Kembali ke dashboard</span>
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">{trip.name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-neutral-600">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4 text-neutral-400" aria-hidden />
            {trip.city}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarBlank className="size-4 text-neutral-400" aria-hidden />
            {formatDateRange(trip.startDate, trip.endDate)}
          </span>
          <Badge variant="neutral">{trip.baseCurrency}</Badge>
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-neutral-500">
          Rencana harian ({trip.days.length} hari)
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {trip.days.map((day, index) => (
            <Card key={day.id} className="bg-white p-4">
              <p className="text-[13px] font-semibold text-teal-700">
                Hari {index + 1}
              </p>
              <p className="mt-1 text-[13px] text-neutral-600">
                {dayFmt.format(day.date)}
              </p>
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

        <MemberList
          tripId={tripId}
          members={memberRows}
          canManage={isOwner}
        />
      </section>
    </div>
  );
}
