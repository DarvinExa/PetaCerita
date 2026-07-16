import Link from "next/link";
import { MapTrifold } from "@phosphor-icons/react/dist/ssr";

export default function AppNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-1 items-center px-4 py-16">
      <section className="mx-auto flex w-full max-w-xl flex-col items-center rounded-lg border border-dashed border-neutral-300 bg-white px-6 py-14 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-teal-50 text-teal-700">
          <MapTrifold className="size-7" aria-hidden />
        </span>
        <p className="mt-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-teal-700">
          Halaman tidak ditemukan
        </p>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">
          Perjalanan ini tidak tersedia
        </h1>
        <p className="mt-2 max-w-md text-[14px] leading-6 text-neutral-600">
          Tautan mungkin sudah tidak berlaku atau kamu tidak mempunyai akses ke
          perjalanan ini.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-teal-700 px-4 text-[15px] font-semibold text-white hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
        >
          Kembali ke dashboard
        </Link>
      </section>
    </div>
  );
}
