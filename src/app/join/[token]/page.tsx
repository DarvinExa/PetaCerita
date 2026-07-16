import Link from "next/link";
import type { Metadata } from "next";
import { MapTrifold, Warning } from "@phosphor-icons/react/dist/ssr";
import { getCurrentUser } from "@/server/auth";
import {
  peekInviteTripName,
  joinViaInviteForm,
} from "@/features/invites/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Gabung Trip - PetaCerita" };

type JoinStatus = "expired" | "invalid" | "ratelimited";

function StatusNote({ status }: { status: JoinStatus }) {
  const message =
    status === "expired"
      ? "Link undangan ini sudah kedaluwarsa. Minta link baru ke pemilik trip."
      : status === "ratelimited"
        ? "Terlalu banyak percobaan. Coba lagi beberapa saat."
        : "Link undangan tidak valid atau sudah dicabut.";
  return (
    <div
      role="alert"
      className="flex items-start gap-2 doodle-box-alt border border-danger/30 bg-danger/5 px-3 py-2.5 text-[13px] text-danger"
    >
      <Warning className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{message}</span>
    </div>
  );
}

export default async function JoinPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { token } = await params;
  const { status } = await searchParams;

  const [user, invite] = await Promise.all([
    getCurrentUser(),
    peekInviteTripName(token),
  ]);

  const errorStatus: JoinStatus | null =
    status === "expired" || status === "ratelimited"
      ? status
      : invite.status === "expired"
        ? "expired"
        : invite.status === "invalid"
          ? "invalid"
          : status === "invalid"
            ? "invalid"
            : null;

  const tripName = invite.status === "valid" ? invite.tripName : null;
  const loginHref = `/login?next=${encodeURIComponent(`/join/${token}`)}`;

  return (
    <main className="flex min-h-full flex-col items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-[400px]">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 text-teal-700"
        >
          <MapTrifold className="size-6" weight="bold" aria-hidden />
          <span className="text-lg font-bold">PetaCerita</span>
        </Link>

        <Card>
          <CardContent className="flex flex-col gap-5 p-6">
            {errorStatus ? (
              <>
                <StatusNote status={errorStatus} />
                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="w-full"
                >
                  <Link href={user ? "/dashboard" : "/login"}>
                    {user ? "Ke dashboard" : "Masuk"}
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1">
                  <p className="text-[13px] text-neutral-600">
                    Kamu diundang bergabung ke trip
                  </p>
                  <h1 className="text-xl font-bold text-neutral-900">
                    {tripName}
                  </h1>
                </div>

                {user ? (
                  // Aksi mutasi hanya lewat POST, bukan saat render GET.
                  <form action={joinViaInviteForm}>
                    <input type="hidden" name="token" value={token} />
                    <Button type="submit" size="lg" className="w-full">
                      Gabung trip
                    </Button>
                  </form>
                ) : (
                  <>
                    <p className="text-[13px] text-neutral-600">
                      Masuk atau daftar dulu untuk bergabung. Setelah masuk kamu
                      otomatis jadi anggota.
                    </p>
                    <Button asChild size="lg" className="w-full">
                      <Link href={loginHref}>Masuk untuk gabung</Link>
                    </Button>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
