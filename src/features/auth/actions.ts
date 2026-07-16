"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { createSupabaseServerClient } from "@/server/supabase";
import { rateLimit } from "@/server/rate-limit";
import { safeInternalPath } from "@/lib/redirects";

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
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  const headerList = await headers();
  const origin = headerList.get("origin");
  if (origin) return origin;
  const host = headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

async function clientIp(): Promise<string> {
  const headerList = await headers();
  return (
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "unknown"
  );
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

  const ip = await clientIp();
  const gate = rateLimit(
    `auth:password:${ip}:${parsed.data.email.toLowerCase()}`,
    8,
    60_000,
  );
  if (!gate.ok)
    return { error: "Terlalu banyak percobaan. Coba lagi sebentar." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: "Email atau kata sandi salah" };
  }

  redirect(safeInternalPath(formData.get("next")));
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
  const gate = rateLimit(`auth:google:${await clientIp()}`, 10, 60_000);
  if (!gate.ok) redirect("/login?error=ratelimit");

  const origin = await getOrigin();
  const next = safeInternalPath(formData.get("next"));
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
