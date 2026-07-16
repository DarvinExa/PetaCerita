import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { AuthForm } from "@/features/auth/auth-form";
import { GoogleButton } from "@/features/auth/google-button";
import { loginWithEmail } from "@/features/auth/actions";

export const metadata: Metadata = { title: "Masuk - PetaCerita" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; pesan?: string; error?: string }>;
}) {
  const { next, pesan, error } = await searchParams;

  return (
    <Card>
      <CardContent className="flex flex-col gap-5 p-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-neutral-900">Masuk</h1>
          <p className="text-[13px] text-neutral-600">
            Lanjutkan menyusun trip kamu.
          </p>
        </div>

        {pesan === "cek-email" ? (
          <p className="doodle-box-alt border border-teal-200 bg-teal-50 px-3 py-2.5 text-[13px] text-teal-800">
            Cek email kamu untuk konfirmasi akun, lalu masuk di sini.
          </p>
        ) : null}
        {error ? (
          <p className="doodle-box-alt border border-danger/30 bg-danger/5 px-3 py-2.5 text-[13px] text-danger">
            Gagal masuk. Coba lagi.
          </p>
        ) : null}

        <GoogleButton next={next} />

        <div className="flex items-center gap-3 text-[13px] text-neutral-400">
          <span className="h-px flex-1 bg-neutral-200" />
          atau
          <span className="h-px flex-1 bg-neutral-200" />
        </div>

        <AuthForm
          mode="login"
          action={loginWithEmail}
          next={next}
          submitLabel="Masuk"
        />

        <p className="text-center text-[13px] text-neutral-600">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="font-semibold text-teal-700 hover:text-teal-800"
          >
            Daftar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
