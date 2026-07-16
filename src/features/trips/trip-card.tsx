import Link from "next/link";
import {
  MapPin,
  CalendarBlank,
  Users,
  ArrowUpRight,
} from "@phosphor-icons/react/dist/ssr";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateRange } from "@/lib/dates";
import type { TripCardData } from "./queries";

export function TripCard({ trip }: { trip: TripCardData }) {
  return (
    <Link
      href={`/trips/${trip.id}`}
      className="group block doodle-sticker focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
    >
      <Card className="relative h-full overflow-hidden p-5 transition-[transform,box-shadow,border-color] group-hover:-translate-y-0.5 group-hover:border-teal-200 group-hover:shadow-[0_18px_50px_rgba(15,118,110,0.12)]">
        <span
          className="absolute inset-y-0 left-0 w-1 bg-teal-600"
          aria-hidden
        />
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-teal-700">
              {trip.city}
            </p>
            <h3 className="mt-1 text-[17px] font-semibold tracking-[-0.01em] text-neutral-900">
              {trip.name}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {trip.role === "OWNER" ? <Badge variant="teal">Owner</Badge> : null}
            <ArrowUpRight
              className="size-4 text-neutral-300 transition-all duration-300 ease-in-out group-hover:text-teal-600"
              aria-hidden
            />
          </div>
        </div>

        <dl className="mt-4 flex flex-col gap-2 border-t border-neutral-100 pt-4 text-[13px] text-neutral-600">
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
          <div className="flex items-center gap-1.5">
            <MapPin className="size-4 text-neutral-400" aria-hidden />
            <dd>{trip.baseCurrency}</dd>
          </div>
        </dl>
      </Card>
    </Link>
  );
}
