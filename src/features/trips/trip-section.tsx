import { TripCard } from "./trip-card";
import type { TripCardData } from "./queries";

interface TripSectionProps {
  title: string;
  trips: TripCardData[];
}

/** Satu grup trip di dashboard (mis. Sedang berlangsung). */
export function TripSection({ title, trips }: TripSectionProps) {
  if (trips.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-neutral-600">
          {title}
        </h2>
        <span className="h-px flex-1 bg-neutral-200" aria-hidden />
        <span className="text-[12px] font-medium tabular-nums text-neutral-400">
          {trips.length}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {trips.map((trip) => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>
    </section>
  );
}
