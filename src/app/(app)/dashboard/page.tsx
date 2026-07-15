import Link from "next/link";
import type { Metadata } from "next";
import { Plus, Compass } from "@phosphor-icons/react/dist/ssr";
import { requireUser } from "@/server/auth";
import { getTripsForUser } from "@/features/trips/queries";
import { TripSection } from "@/features/trips/trip-section";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Trip Saya - PetaCerita" };

export default async function DashboardPage() {
  const user = await requireUser();
  const trips = await getTripsForUser(user.id);
  const isEmpty =
    trips.upcoming.length === 0 &&
    trips.ongoing.length === 0 &&
    trips.past.length === 0;

  return (
    <div className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Trip Saya</h1>
          <p className="text-[13px] text-neutral-600">
            Rencanakan dan kelola perjalanan kamu.
          </p>
        </div>
        <Button asChild size="md">
          <Link href="/trips/new">
            <Plus className="size-4" weight="bold" aria-hidden />
            <span>Buat Trip</span>
          </Link>
        </Button>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-md border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-teal-50 text-teal-700">
            <Compass className="size-6" aria-hidden />
          </div>
          <div>
            <p className="font-semibold text-neutral-900">Belum ada trip</p>
            <p className="mt-1 text-[13px] text-neutral-600">
              Mulai dengan membuat trip pertama kamu.
            </p>
          </div>
          <Button asChild>
            <Link href="/trips/new">
              <Plus className="size-4" weight="bold" aria-hidden />
              <span>Buat Trip</span>
            </Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <TripSection title="Sedang berlangsung" trips={trips.ongoing} />
          <TripSection title="Akan datang" trips={trips.upcoming} />
          <TripSection title="Selesai" trips={trips.past} />
        </div>
      )}
    </div>
  );
}
