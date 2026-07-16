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
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const highlights = [
  {
    icon: Compass,
    tone: "bg-teal-100 text-teal-800",
    title: "Itinerary yang enak dilihat",
    body: "Kumpulkan ide, pilih hari, atur jam, dan susun urutan kunjungan dalam satu alur yang ringan.",
  },
  {
    icon: MapTrifold,
    tone: "bg-sky-100 text-sky-500",
    title: "Peta untuk setiap hari",
    body: "Lihat rute harian, jarak antartempat, dan buka kembali listing Google Maps asli kapan saja.",
  },
  {
    icon: Wallet,
    tone: "bg-coral-100 text-coral-500",
    title: "Patungan tanpa drama",
    body: "Bagi tagihan per item, hitung saldo otomatis, lalu konfirmasi transfer dari kedua pihak.",
  },
];

const steps = [
  [
    "01",
    "Buat ruang trip",
    "Tentukan kota, tanggal, mata uang, lalu undang teman dengan satu tautan.",
  ],
  [
    "02",
    "Kumpulkan ide",
    "Tempel link Google Maps dan simpan semua kandidat tempat sebelum menentukan hari.",
  ],
  [
    "03",
    "Susun dan berangkat",
    "Pilih hari, rapikan urutan, cek jarak, lalu kelola pengeluaran selama perjalanan.",
  ],
];

export default function HomePage() {
  return (
    <main className="overflow-hidden text-slate-800">
      <section className="relative mx-auto grid min-h-[760px] w-full max-w-[1240px] items-center gap-14 px-5 py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-28">
        <div className="hidden" aria-hidden />
        <div className="hidden" aria-hidden />
        <div className="relative z-10">
          <Badge
            variant="teal"
            className="px-4 py-2 text-[13px] font-bold shadow-[0_8px_24px_rgba(20,184,166,.12)]"
          >
            Catatan perjalanan bersama
          </Badge>
          <h1 className="scribble-underline mt-7 max-w-3xl text-[42px] font-extrabold leading-[1.08] tracking-[-0.045em] text-slate-800 sm:text-6xl lg:text-[68px]">
            Semua rencana perjalananmu, terasa lebih menyenangkan.
          </h1>
          <p className="mt-6 max-w-xl text-[17px] font-medium leading-relaxed text-slate-600 sm:text-lg">
            PetaCerita menyatukan ide tempat, agenda harian, peta rute, budget,
            dan patungan dalam ruang kolaborasi yang ramah untuk semua teman
            perjalanan.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/register">
                Mulai trip gratis{" "}
                <ArrowRight className="size-5" weight="bold" aria-hidden />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/login">Masuk ke akun</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[13px] font-bold text-slate-500">
            <span className="flex items-center gap-2">
              <CheckCircle className="size-5 text-teal-600" weight="fill" />
              Kolaborasi real-time
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="size-5 text-teal-600" weight="fill" />
              Tanpa spreadsheet
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="size-5 text-teal-600" weight="fill" />
              Mobile friendly
            </span>
          </div>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[540px]">
          <div className="doodle-box tape doodle-lift rotate-1 p-4 shadow-[0_30px_80px_rgba(15,118,110,.16)] transition-all duration-300 ease-in-out hover:rotate-0 hover:scale-[1.02]">
            <div className="doodle-box-alt bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-extrabold uppercase tracking-[.14em] text-teal-600">
                    Trip berikutnya
                  </p>
                  <h2 className="mt-1 text-2xl font-extrabold text-slate-800">
                    Cerita di Yogyakarta
                  </h2>
                </div>
                <span className="flex size-12 items-center justify-center doodle-sticker bg-coral-100 text-coral-500">
                  <MapTrifold className="size-6" weight="bold" />
                </span>
              </div>
              <div className="mt-5 flex gap-2 overflow-hidden">
                <span className="rounded-full bg-teal-700 px-4 py-2 text-xs font-bold text-white">
                  Hari 1
                </span>
                <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-500">
                  Hari 2
                </span>
                <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-500">
                  Hari 3
                </span>
              </div>
              <div className="mt-5 doodle-box-alt bg-sky-50 p-4">
                <div className="flex h-40 items-center justify-center doodle-sticker bg-[radial-gradient(circle_at_20%_30%,#99f6e4_0,transparent_24%),radial-gradient(circle_at_78%_62%,#fecaca_0,transparent_22%),#e0f2fe]">
                  <div className="flex items-center gap-3 rounded-full bg-white px-4 py-2 text-xs font-extrabold text-slate-700 shadow-lg">
                    <MapPin className="size-4 text-coral-500" weight="fill" />4
                    tempat terhubung
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  "Sarapan di Pasar Kranggan",
                  "Jalan santai di Taman Sari",
                  "Senja di Bukit Bintang",
                ].map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 doodle-box-alt bg-white p-3"
                  >
                    <span className="flex size-9 items-center justify-center doodle-sticker bg-teal-100 text-xs font-extrabold text-teal-800">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-bold text-slate-700">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-extrabold uppercase tracking-[.16em] text-teal-600">
            Satu tempat untuk semuanya
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-800 sm:text-5xl">
            Fokus menikmati trip, bukan mengurus kerumitannya.
          </h2>
          <p className="mt-4 text-base font-medium leading-relaxed text-slate-600">
            Setiap fitur dirancang untuk membuat keputusan kelompok terasa lebih
            sederhana, jelas, dan menyenangkan.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {highlights.map(({ icon: Icon, tone, title, body }) => (
            <Card
              key={title}
              className="doodle-lift rotate-1 border-transparent p-2 odd:-rotate-1"
            >
              <CardHeader>
                <span
                  className={`flex size-14 items-center justify-center doodle-sticker ${tone}`}
                >
                  <Icon className="size-7" weight="bold" />
                </span>
                <CardTitle className="mt-4 text-xl font-extrabold">
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium leading-relaxed text-slate-600">
                  {body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-5 py-20 lg:px-8">
        <div className="doodle-box-alt rotate-1 bg-[#fffdf0] px-6 py-12 text-slate-800 sm:px-10 lg:px-14">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <span className="flex size-14 items-center justify-center doodle-sticker bg-white/15">
                <CalendarCheck className="size-7" weight="bold" />
              </span>
              <h2 className="mt-5 text-3xl font-extrabold text-slate-800 sm:text-4xl">
                Dari obrolan grup menjadi rencana nyata.
              </h2>
              <p className="mt-4 font-medium leading-relaxed text-slate-600">
                Tidak ada lagi ide yang tenggelam, jadwal yang tercecer, atau
                hitungan patungan yang membingungkan.
              </p>
            </div>
            <div className="grid gap-4">
              {steps.map(([number, title, body]) => (
                <div
                  key={number}
                  className="doodle-box-alt doodle-box bg-white p-5 backdrop-blur"
                >
                  <div className="flex gap-4">
                    <span className="text-2xl font-black text-sand-200">
                      {number}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">
                        {title}
                      </h3>
                      <p className="mt-1 text-sm font-medium leading-relaxed text-slate-600">
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

      <section className="mx-auto w-full max-w-[980px] px-5 py-24 text-center">
        <span className="mx-auto flex size-16 items-center justify-center doodle-box-alt bg-coral-100 text-coral-500 shadow-[0_12px_34px_rgba(169,79,64,.13)]">
          <Users className="size-8" weight="bold" />
        </span>
        <h2 className="mt-6 text-4xl font-extrabold text-slate-800 sm:text-5xl">
          Cerita perjalanan terbaik dimulai dari rencana yang terasa ringan.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg font-medium leading-relaxed text-slate-600">
          Ajak temanmu, kumpulkan semua ide, lalu bangun perjalanan yang
          benar-benar ingin kalian jalani bersama.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/register">
            Buat trip pertamamu <ArrowRight className="size-5" weight="bold" />
          </Link>
        </Button>
      </section>

      <footer className="border-t border-white/80 bg-white/70">
        <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-4 px-5 py-8 text-sm font-bold text-slate-500 sm:flex-row lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-teal-800">
            <MapTrifold className="size-5" weight="bold" />
            PetaCerita
          </Link>
          <p>Rencanakan, jalani, lalu ceritakan.</p>
        </div>
      </footer>
    </main>
  );
}
