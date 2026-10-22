import Link from "next/link";
import {
  MapTrifold,
  Compass,
  Wallet,
  ArrowRight,
  Users,
  CalendarCheck,
  CheckCircle,
  MapPin,
  Sparkle,
  Clock,
  Receipt,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";

const highlights = [
  {
    icon: Compass,
    bubbleBg: "bg-teal-100/90 text-teal-700 border-teal-200/70",
    title: "Itinerary yang enak dilihat",
    body: "Kumpulkan ide, pilih hari, atur jam, dan susun urutan kunjungan dalam satu alur yang ringan dan tertata rapi.",
    preview: {
      time: "09:00",
      place: "Pantai Parangtritis",
      badge: "Tersusun rapi",
      badgeColor: "bg-teal-50 text-teal-800 border-teal-200/70",
    },
  },
  {
    icon: MapTrifold,
    bubbleBg: "bg-coral-100/90 text-coral-600 border-coral-200/70",
    title: "Peta untuk setiap hari",
    body: "Lihat rute harian, estimasi jarak antarlokasi, dan buka kembali tautan Google Maps asli kapan saja tanpa ribet.",
    preview: {
      time: "4.2 km",
      place: "Kranggan ke Taman Sari",
      badge: "12 mnt rute",
      badgeColor: "bg-coral-50 text-coral-700 border-coral-200/70",
    },
  },
  {
    icon: Wallet,
    bubbleBg: "bg-sand-100/90 text-sand-700 border-sand-200/70",
    title: "Patungan tanpa drama",
    body: "Bagi tagihan per item, hitung saldo otomatis, lalu konfirmasi transfer kedua pihak secara transparan dan tuntas.",
    preview: {
      time: "Rp 35.000",
      place: "Nasi Gudeg (4 orang)",
      badge: "Bagi rata",
      badgeColor: "bg-sand-50 text-sand-800 border-sand-200/70",
    },
  },
];

const steps = [
  {
    number: "01",
    numColor: "bg-teal-100 text-teal-800 border-teal-200/70",
    title: "Buat ruang trip",
    body: "Tentukan kota tujuan, tanggal perjalanan, mata uang default, lalu bagikan satu tautan undangan instan ke teman-temanmu.",
  },
  {
    number: "02",
    numColor: "bg-sand-100 text-sand-800 border-sand-200/70",
    title: "Kumpulkan ide tempat",
    body: "Tempel tautan Google Maps dan tampung semua rekomendasi kuliner atau wisata sebelum mengunci agenda harian.",
  },
  {
    number: "03",
    numColor: "bg-coral-100 text-coral-800 border-coral-200/70",
    title: "Susun jadwal dan nikmati liburan",
    body: "Atur urutan tempat, pantau estimasi jarak, catat pengeluaran bersama, dan nikmati momen perjalanan tanpa rasa cemas.",
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden selection:bg-coral-100 selection:text-teal-900">
      {/* Ambient background clay orbs: Deep Ocean Teal, Sunset Terracotta, and Warm Sand */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-teal-200/20 blur-3xl" />
        <div className="absolute top-1/4 -right-20 h-96 w-96 rounded-full bg-coral-200/15 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-sand-200/20 blur-3xl" />
      </div>

      {/* Floating Clay Navbar (Pure White surface & Deep Ocean Teal brand) */}
      <nav className="mx-auto max-w-[1200px] px-4 pt-4 sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between rounded-full border border-white/90 bg-white/85 px-4 py-2.5 shadow-[0_8px_24px_-4px_rgba(15,76,92,0.08),inset_2px_2px_4px_rgba(255,255,255,0.98),inset_-2px_-2px_4px_rgba(30,41,59,0.03)] backdrop-blur-md sm:px-6">
          <Link href="/" aria-label="PetaCerita Beranda">
            <BrandLogo compact />
          </Link>

          <div className="hidden items-center gap-6 sm:flex">
            <a
              href="#fitur"
              className="text-sm font-semibold text-neutral-600 transition-colors hover:text-teal-700"
            >
              Fitur
            </a>
            <a
              href="#cara-kerja"
              className="text-sm font-semibold text-neutral-600 transition-colors hover:text-teal-700"
            >
              Cara Kerja
            </a>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Masuk</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Mulai Gratis</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main>
        <section className="relative mx-auto grid min-h-[700px] w-full max-w-[1240px] items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:gap-14 lg:py-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/70 bg-teal-50/90 px-4 py-1.5 text-xs font-bold text-teal-800 shadow-[0_4px_12px_rgba(15,76,92,0.08),inset_1px_1px_3px_rgba(255,255,255,0.95)]">
              <Sparkle className="size-4 text-sand-500" weight="fill" />
              <span>Perencana Perjalanan Kolaboratif</span>
            </div>

            <h1 className="mt-6 text-[36px] font-extrabold leading-[1.14] tracking-[-0.035em] text-neutral-800 sm:text-[48px] lg:text-[54px]">
              Karena setiap rencana perjalanan akan menghasilkan
              <span className="mt-2 block bg-gradient-to-r from-teal-700 via-teal-600 to-coral-500 bg-clip-text text-transparent">
                cerita baru
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-[16px] font-medium leading-relaxed text-neutral-500 sm:text-lg">
              PetaCerita menyatukan ide tempat, agenda harian, peta rute,
              budget, dan patungan dalam ruang kolaborasi yang ramah untuk semua
              teman perjalanan.
            </p>

            <div className="mt-8 flex flex-wrap gap-3.5">
              <Button size="lg" asChild>
                <Link href="/register">
                  <span>Mulai trip gratis</span>
                  <ArrowRight className="size-5" weight="bold" aria-hidden />
                </Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/login">Masuk ke akun</Link>
              </Button>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-[13px] font-bold text-neutral-600">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/80 px-3 py-1.5 shadow-sm">
                <CheckCircle className="size-4 text-teal-600" weight="fill" />
                Kolaborasi real-time
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/80 px-3 py-1.5 shadow-sm">
                <CheckCircle className="size-4 text-sand-500" weight="fill" />
                Tanpa spreadsheet
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/80 px-3 py-1.5 shadow-sm">
                <CheckCircle className="size-4 text-coral-500" weight="fill" />
                Ramah di ponsel
              </span>
            </div>
          </div>

          {/* Hero 3D Clay Trip Preview Device (Warm Compass Palette) */}
          <div className="relative mx-auto w-full max-w-[540px]">
            <div className="clay-card-interactive rounded-[32px] border border-white/95 bg-white p-6 shadow-[16px_24px_40px_-8px_rgba(15,76,92,0.12),0_6px_16px_rgba(30,41,59,0.04),inset_3px_3px_6px_rgba(255,255,255,0.98),inset_-3px_-3px_8px_rgba(30,41,59,0.04)] sm:p-7">
              {/* Trip Header */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-teal-700">
                    Trip Berikutnya
                  </span>
                  <h2 className="mt-0.5 text-2xl font-extrabold tracking-tight text-neutral-800">
                    Cerita di Yogyakarta
                  </h2>
                  <p className="mt-0.5 text-xs font-semibold text-neutral-500">
                    24 - 27 Okt 2026, 4 Teman Perjalanan
                  </p>
                </div>
                <span className="clay-icon-bubble flex size-12 items-center justify-center border border-coral-200/70 bg-coral-100/90 text-coral-600">
                  <MapTrifold className="size-6" weight="bold" />
                </span>
              </div>

              {/* Day selector tabs */}
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  className="clay-btn-primary rounded-xl px-4 py-1.5 text-xs font-bold shadow-sm"
                >
                  Hari 1
                </button>
                <button
                  type="button"
                  className="clay-btn-secondary rounded-xl px-4 py-1.5 text-xs font-bold text-neutral-600 shadow-sm"
                >
                  Hari 2
                </button>
                <button
                  type="button"
                  className="clay-btn-secondary rounded-xl px-4 py-1.5 text-xs font-bold text-neutral-600 shadow-sm"
                >
                  Hari 3
                </button>
              </div>

              {/* Sunken Clay Map Canvas (Warm Compass route) */}
              <div className="clay-sunken relative mt-5 flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-teal-50/70 via-sand-50/50 to-white p-4">
                <svg
                  className="absolute inset-0 h-full w-full opacity-40"
                  viewBox="0 0 400 160"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M 50 120 Q 150 40 220 90 T 360 50"
                    stroke="#0F4C5C"
                    strokeWidth="4"
                    strokeDasharray="6 6"
                  />
                  <circle cx="50" cy="120" r="7" fill="#0F4C5C" />
                  <circle cx="220" cy="90" r="7" fill="#FB8B24" />
                  <circle cx="360" cy="50" r="7" fill="#E36414" />
                </svg>

                <div className="relative z-10 flex items-center gap-2 rounded-full border border-white/95 bg-white/95 px-4 py-2 text-xs font-extrabold text-neutral-800 shadow-[0_6px_14px_rgba(30,41,59,0.08),inset_1px_1px_2px_rgba(255,255,255,1)]">
                  <MapPin className="size-4 text-coral-500" weight="fill" />
                  <span>3 lokasi terhubung, estimasi 18 km</span>
                </div>
              </div>

              {/* Itinerary Tiles */}
              <div className="mt-4 space-y-2.5">
                {[
                  {
                    num: "01",
                    title: "Sarapan di Pasar Kranggan",
                    time: "08:30",
                    numStyle: "bg-teal-100 text-teal-800 border-teal-200/70",
                  },
                  {
                    num: "02",
                    title: "Jalan santai di Taman Sari",
                    time: "10:30",
                    numStyle: "bg-sand-100 text-sand-800 border-sand-200/70",
                  },
                  {
                    num: "03",
                    title: "Senja di Bukit Bintang",
                    time: "16:45",
                    numStyle: "bg-coral-100 text-coral-800 border-coral-200/70",
                  },
                ].map(({ num, title, time, numStyle }) => (
                  <div
                    key={num}
                    className="flex items-center justify-between rounded-2xl border border-white/90 bg-white px-3.5 py-2.5 shadow-[0_4px_12px_rgba(30,41,59,0.04),inset_2px_2px_4px_rgba(255,255,255,0.95),inset_-2px_-2px_4px_rgba(30,41,59,0.02)] transition-transform hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`clay-badge flex size-8 items-center justify-center border text-xs font-black ${numStyle}`}
                      >
                        {num}
                      </span>
                      <span className="text-sm font-bold text-neutral-800">
                        {title}
                      </span>
                    </div>
                    <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-bold text-neutral-500">
                      {time}
                    </span>
                  </div>
                ))}
              </div>

              {/* Split bill quick status strip */}
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-teal-200/70 bg-teal-50/80 px-4 py-2.5 text-xs shadow-sm">
                <span className="flex items-center gap-2 font-bold text-neutral-800">
                  <Receipt className="size-4 text-teal-700" weight="bold" />
                  Patungan: Rp 640.000
                </span>
                <span className="flex items-center gap-1.5 font-bold text-teal-800">
                  <CheckCircle className="size-4 text-teal-600" weight="fill" />
                  Semua terkonfirmasi
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Section */}
        <section
          id="fitur"
          className="mx-auto w-full max-w-[1240px] px-4 py-20 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200/70 bg-teal-50/90 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-teal-800 shadow-sm">
              Satu Tempat Untuk Semuanya
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-neutral-800 sm:text-5xl">
              Fokus menikmati trip, bukan mengurus kerumitannya.
            </h2>
            <p className="mt-4 text-base font-medium leading-relaxed text-neutral-500">
              Setiap fitur dirancang untuk membuat keputusan kelompok terasa
              lebih sederhana, jelas, dan menyenangkan.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {highlights.map(
              ({ icon: Icon, bubbleBg, title, body, preview }) => (
                <div
                  key={title}
                  className="clay-card-interactive flex flex-col justify-between rounded-[28px] border border-white/95 bg-white p-7 shadow-[10px_16px_28px_-6px_rgba(15,76,92,0.08),0_4px_12px_rgba(30,41,59,0.04),inset_3px_3px_6px_rgba(255,255,255,0.98),inset_-3px_-3px_8px_rgba(30,41,59,0.04)]"
                >
                  <div>
                    <span
                      className={`clay-icon-bubble inline-flex size-14 items-center justify-center border ${bubbleBg}`}
                    >
                      <Icon className="size-7" weight="bold" />
                    </span>
                    <h3 className="mt-5 text-xl font-extrabold text-neutral-800">
                      {title}
                    </h3>
                    <p className="mt-2.5 text-[15px] font-medium leading-relaxed text-neutral-500">
                      {body}
                    </p>
                  </div>

                  {/* Tactile Mini Preview inside card */}
                  <div className="mt-6 rounded-2xl border border-neutral-100 bg-neutral-50/80 p-3.5 shadow-inner">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-bold text-neutral-800">
                        <Clock className="size-3.5 text-teal-700" />
                        {preview.time}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${preview.badgeColor}`}
                      >
                        {preview.badge}
                      </span>
                    </div>
                    <p className="mt-1.5 truncate text-xs font-semibold text-neutral-600">
                      {preview.place}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </section>

        {/* Step by Step Workflow Section */}
        <section
          id="cara-kerja"
          className="mx-auto w-full max-w-[1240px] px-4 py-16 sm:px-6 lg:px-8"
        >
          <div className="clay-card-warm rounded-[36px] border border-sand-200/80 p-7 sm:p-12 lg:p-14">
            <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
              <div>
                <span className="clay-icon-bubble flex size-14 items-center justify-center border border-coral-200/80 bg-coral-100 text-coral-600">
                  <CalendarCheck className="size-7" weight="bold" />
                </span>
                <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-neutral-800 sm:text-4xl">
                  Dari obrolan grup menjadi rencana nyata.
                </h2>
                <p className="mt-4 text-[16px] font-medium leading-relaxed text-neutral-500">
                  Tidak ada lagi ide yang tenggelam di chat grup, jadwal yang
                  tercecer di catatan pribadi, atau hitungan patungan yang
                  membingungkan saat pulang liburan.
                </p>
                <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-teal-200/70 bg-white/90 px-4 py-2 text-xs font-bold text-teal-800 shadow-sm">
                  <CheckCircle className="size-4 text-teal-600" weight="fill" />
                  <span>Semua anggota trip dapat mengakses link yang sama</span>
                </div>
              </div>

              <div className="grid gap-4">
                {steps.map(({ number, numColor, title, body }) => (
                  <div
                    key={number}
                    className="clay-card rounded-2xl border border-white/95 bg-white p-5 shadow-[6px_10px_20px_-4px_rgba(30,41,59,0.05),inset_2px_2px_4px_rgba(255,255,255,0.98),inset_-2px_-2px_4px_rgba(30,41,59,0.03)]"
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className={`clay-badge flex size-10 shrink-0 items-center justify-center border text-sm font-black ${numColor}`}
                      >
                        {number}
                      </span>
                      <div>
                        <h3 className="text-base font-extrabold text-neutral-800">
                          {title}
                        </h3>
                        <p className="mt-1 text-sm font-medium leading-relaxed text-neutral-500">
                          {body}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Call To Action Section */}
        <section className="mx-auto w-full max-w-[1040px] px-4 py-20 text-center sm:px-6">
          <div className="clay-card rounded-[36px] border border-white/95 bg-white p-8 shadow-[14px_22px_36px_-6px_rgba(15,76,92,0.1),inset_3px_3px_6px_rgba(255,255,255,0.98),inset_-3px_-3px_8px_rgba(30,41,59,0.04)] sm:p-14">
            <span className="clay-icon-bubble mx-auto flex size-16 items-center justify-center border border-teal-200/70 bg-teal-100/90 text-teal-800">
              <Users className="size-8" weight="bold" />
            </span>
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-neutral-800 sm:text-4xl lg:text-5xl">
              Cerita perjalanan terbaik dimulai dari rencana yang terasa ringan.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[16px] font-medium leading-relaxed text-neutral-500 sm:text-lg">
              Ajak temanmu, kumpulkan semua ide tempat, lalu bangun perjalanan
              yang benar-benar ingin kalian jalani bersama.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/register">
                  <span>Buat trip pertamamu</span>
                  <ArrowRight className="size-5" weight="bold" />
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-xs font-semibold text-neutral-500">
              Gratis untuk perjalanan pertama, tanpa perlu kartu kredit.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200/60 bg-white/70 py-8 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-4 px-4 text-xs font-semibold text-neutral-500 sm:flex-row sm:px-6 lg:px-8">
          <Link href="/" aria-label="PetaCerita Beranda">
            <BrandLogo compact />
          </Link>
          <p>
            PetaCerita, karena setiap rencana perjalanan akan menghasilkan
            cerita baru.
          </p>
          <div className="flex items-center gap-4 text-teal-700">
            <Link href="/login" className="hover:underline">
              Masuk
            </Link>
            <span>&middot;</span>
            <Link href="/register" className="hover:underline">
              Daftar
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
