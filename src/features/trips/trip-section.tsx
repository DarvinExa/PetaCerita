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
      <h2 className="text-[13px] font-semibold uppercase tracking-wide text-neutral-500">
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {trips.map((trip) => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>
    </section>
  );
}
