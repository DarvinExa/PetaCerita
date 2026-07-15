import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { AuthForm } from "@/features/auth/auth-form";
import { GoogleButton } from "@/features/auth/google-button";
import { registerWithEmail } from "@/features/auth/actions";

export const metadata: Metadata = { title: "Daftar - PetaCerita" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <Card>
      <CardContent className="flex flex-col gap-5 p-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-neutral-900">Daftar</h1>
          <p className="text-[13px] text-neutral-600">
            Buat akun untuk mulai merencanakan trip bareng teman.
          </p>
        </div>

        <GoogleButton next={next} />

        <div className="flex items-center gap-3 text-[13px] text-neutral-400">
          <span className="h-px flex-1 bg-neutral-200" />
          atau
          <span className="h-px flex-1 bg-neutral-200" />
        </div>

        <AuthForm
          mode="register"
          action={registerWithEmail}
          next={next}
          submitLabel="Daftar"
        />

        <p className="text-center text-[13px] text-neutral-600">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="font-semibold text-teal-700 hover:text-teal-800"
          >
            Masuk
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
