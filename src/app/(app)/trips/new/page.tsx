import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent } from "@/components/ui/card";
import { CreateTripForm } from "@/features/trips/create-trip-form";

export const metadata: Metadata = { title: "Buat Trip - PetaCerita" };

export default function NewTripPage() {
  return (
    <div className="mx-auto w-full max-w-[560px] flex-1 px-4 py-8">
      <Link
        href="/dashboard"
        className="mb-5 inline-flex min-h-10 items-center gap-2 px-5 py-2 rounded-full clay-card text-[13px] font-bold text-slate-700 shadow-sm hover:text-teal-900 hover:shadow-md transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
      >
        <ArrowLeft className="size-4" weight="bold" aria-hidden />
        <span>Kembali ke dashboard</span>
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-[-0.02em] text-neutral-900 sm:text-3xl">
          Buat Trip Baru
        </h1>
      </div>

      <Card className="bg-white">
        <CardContent className="p-6">
          <CreateTripForm />
        </CardContent>
      </Card>
    </div>
  );
}
