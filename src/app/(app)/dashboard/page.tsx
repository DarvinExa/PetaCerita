import Link from "next/link";
import type { Metadata } from "next";
import {
  Plus,
  Compass,
  AirplaneTilt,
  CalendarCheck,
} from "@phosphor-icons/react/dist/ssr";
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
    <div className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-8 sm:py-10">
      <section className="relative mb-8 overflow-hidden doodle-box border border-teal-900 bg-[#fffdf0] px-5 py-6 text-slate-800 shadow-[0_18px_50px_rgba(15,118,110,0.12)] sm:px-8 sm:py-8">
        <div
          className="absolute -right-10 -top-14 size-48 rounded-full border-[28px] border-teal-800"
          aria-hidden
        />
        <div
          className="absolute bottom-5 right-24 hidden h-px w-36 bg-teal-700 sm:block"
          aria-hidden
        />
        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <p className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-teal-800">
              <AirplaneTilt className="size-4" aria-hidden />
              Ruang perjalanan kamu
            </p>
            <h1 className="text-2xl font-bold tracking-[-0.02em] sm:text-[32px]">
              Rencana yang rapi, perjalanan yang lebih ringan.
            </h1>
            <p className="mt-2 max-w-lg text-[14px] leading-6 text-slate-600">
              Susun tempat, waktu, anggota, dan pengeluaran dalam satu ruang
              bersama.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="shrink-0 bg-sand-100 text-teal-900 hover:bg-sand-200 active:bg-sand-200 focus-visible:ring-sand-100"
          >
            <Link href="/trips/new">
              <Plus className="size-4" weight="bold" aria-hidden />
              <span>Buat Trip</span>
            </Link>
          </Button>
        </div>
        {!isEmpty ? (
          <div className="relative mt-6 flex flex-wrap gap-3 border-t border-slate-800/30 pt-4 text-[13px] text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <Compass className="size-4" aria-hidden />
              {trips.ongoing.length} sedang berlangsung
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarCheck className="size-4" aria-hidden />
              {trips.upcoming.length} akan datang
            </span>
          </div>
        ) : null}
      </section>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-4 doodle-box border border-dashed border-slate-200/70 bg-white px-6 py-16 text-center shadow-[0_10px_30px_rgba(15,118,110,0.08)]">
          <div className="flex size-12 items-center justify-center doodle-sticker bg-sky-50 text-sky-500">
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
