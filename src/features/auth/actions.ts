"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { createSupabaseServerClient } from "@/server/supabase";

/** Hasil aksi form auth; null berarti sukses (biasanya diikuti redirect). */
export type AuthActionState = { error: string } | null;

const emailSchema = z.string().trim().email("Format email tidak valid");
const passwordSchema = z
  .string()
  .min(8, "Kata sandi minimal 8 karakter")
  .max(72, "Kata sandi maksimal 72 karakter");

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

const registerSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(80),
  email: emailSchema,
  password: passwordSchema,
});

/** Ambil origin dari header request untuk membangun URL redirect absolut. */
async function getOrigin(): Promise<string> {
  const headerList = await headers();
  const origin = headerList.get("origin");
  if (origin) return origin;
  const host = headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

function safeNext(value: FormDataEntryValue | null): string {
  return typeof value === "string" && value.startsWith("/")
    ? value
    : "/dashboard";
}

export async function loginWithEmail(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: "Email atau kata sandi salah" };
  }

  redirect(safeNext(formData.get("next")));
}

export async function registerWithEmail(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }

  const origin = await getOrigin();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.name },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });
  if (error) {
    return { error: "Gagal mendaftar. Coba email lain atau login." };
  }

  // Bila konfirmasi email aktif, sesi belum terbentuk sampai user klik link.
  redirect("/login?pesan=cek-email");
}

export async function loginWithGoogle(formData: FormData): Promise<void> {
  const origin = await getOrigin();
  const next = safeNext(formData.get("next"));
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data.url) {
    redirect("/login?error=oauth");
  }
  redirect(data.url);
}

export async function logout(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
