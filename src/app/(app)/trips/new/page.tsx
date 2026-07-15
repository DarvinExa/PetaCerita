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
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-neutral-600 hover:text-neutral-900"
      >
        <ArrowLeft className="size-4" aria-hidden />
        <span>Kembali ke dashboard</span>
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Buat Trip Baru</h1>
        <p className="text-[13px] text-neutral-600">
          Kami akan otomatis membuat rencana harian sesuai rentang tanggal.
        </p>
      </div>

      <Card className="bg-white">
        <CardContent className="p-6">
          <CreateTripForm />
        </CardContent>
      </Card>
    </div>
  );
}
