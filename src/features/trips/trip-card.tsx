import Link from "next/link";
import {
  MapPin,
  CalendarBlank,
  Users,
  ArrowUpRight,
} from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { formatDateRange } from "@/lib/dates";
import type { TripCardData } from "./queries";

export function TripCard({ trip }: { trip: TripCardData }) {
  return (
    <Link
      href={`/trips/${trip.id}`}
      className="group block rounded-[28px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
    >
      <div className="clay-card-interactive relative h-full overflow-hidden p-6 border border-white/95">
        <span
          className="absolute inset-y-0 left-0 w-1.5 bg-teal-600 rounded-l"
          aria-hidden
        />
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-teal-700">
              {trip.city}
            </p>
            <h3
              className="mt-1 line-clamp-2 text-[17px] font-bold tracking-[-0.01em] text-neutral-800"
              title={trip.name}
            >
              {trip.name}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {trip.role === "OWNER" ? <Badge variant="teal">Owner</Badge> : null}
            <ArrowUpRight
              className="size-4 text-neutral-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-teal-700"
              aria-hidden
            />
          </div>
        </div>

        <dl className="mt-5 flex flex-col gap-2 border-t border-neutral-100 pt-4 text-[13px] font-medium text-neutral-500">
          <div className="flex items-center gap-2">
            <CalendarBlank className="size-4 text-neutral-400" aria-hidden />
            <dd>
              {formatDateRange(trip.startDate, trip.endDate)}
              <span className="text-neutral-400"> ({trip.dayCount} hari)</span>
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <Users className="size-4 text-neutral-400" aria-hidden />
            <dd>{trip.memberCount} peserta</dd>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-neutral-400" aria-hidden />
            <dd>{trip.baseCurrency}</dd>
          </div>
        </dl>
      </div>
    </Link>
  );
}
