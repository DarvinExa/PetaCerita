import Link from "next/link";
import { MapPin, CalendarBlank, Users } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateRange } from "@/lib/dates";
import type { TripCardData } from "./queries";

export function TripCard({ trip }: { trip: TripCardData }) {
  return (
    <Link
      href={`/trips/${trip.id}`}
      className="group block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
    >
      <Card className="h-full bg-white p-4 transition-shadow group-hover:shadow-md">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-neutral-900">{trip.name}</h3>
          {trip.role === "OWNER" ? <Badge variant="teal">Owner</Badge> : null}
        </div>

        <dl className="mt-3 flex flex-col gap-1.5 text-[13px] text-neutral-600">
          <div className="flex items-center gap-1.5">
            <MapPin className="size-4 text-neutral-400" aria-hidden />
            <dd>{trip.city}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <CalendarBlank className="size-4 text-neutral-400" aria-hidden />
            <dd>
              {formatDateRange(trip.startDate, trip.endDate)}
              <span className="text-neutral-400"> ({trip.dayCount} hari)</span>
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="size-4 text-neutral-400" aria-hidden />
            <dd>
              {trip.memberCount}{" "}
              {trip.memberCount === 1 ? "peserta" : "peserta"}
            </dd>
          </div>
        </dl>
      </Card>
    </Link>
  );
}
