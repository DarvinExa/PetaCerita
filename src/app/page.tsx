import Link from "next/link";
import { MapTrifold, Compass, Wallet } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const highlights = [
  {
    icon: Compass,
    title: "Itinerary bareng",
    body: "Susun rencana per hari dan jam, drag ide dari bucket ke timeline tanpa ribet spreadsheet.",
  },
  {
    icon: MapTrifold,
    title: "Tempat dari peta",
    body: "Tempel link Google Maps, foto dan info tempat langsung muncul, lalu tampil di satu peta trip.",
  },
  {
    icon: Wallet,
    title: "Split bill per item",
    body: "Catat siapa ikut menu apa, sistem hitung siapa bayar ke siapa dengan transfer paling sedikit.",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-12 px-4 py-16 md:py-24">
      <section className="flex flex-col gap-5">
        <Badge variant="teal" className="w-fit">
          Perencana perjalanan kolaboratif
        </Badge>
        <h1 className="max-w-2xl text-[32px] font-bold leading-[1.2] text-neutral-900 md:text-5xl">
          Rencanakan trip bareng teman, dari ide sampai bagi tagihan.
        </h1>
        <p className="max-w-xl text-[15px] leading-[1.6] text-neutral-600">
          PetaCerita menggantikan spreadsheet trip yang berantakan. Susun
          itinerary, tarik tempat dari peta, dan bereskan patungan dengan rapi.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button size="lg" asChild>
            <Link href="/register">Mulai rencana trip</Link>
          </Button>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/login">Masuk</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {highlights.map(({ icon: Icon, title, body }) => (
          <Card key={title}>
            <CardHeader>
              <span className="flex size-10 items-center justify-center rounded-md bg-teal-50 text-teal-700">
                <Icon className="size-5" aria-hidden />
              </span>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[15px] leading-[1.6] text-neutral-600">
                {body}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
