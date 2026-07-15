import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@prisma/client";
import { createSupabaseServerClient } from "@/server/supabase";
import { prisma } from "@/server/db";

/** Turunkan nama tampilan dari metadata OAuth atau bagian lokal email. */
function resolveName(
  metadata: Record<string, unknown> | undefined,
  email: string,
): string {
  const candidate =
    (metadata?.full_name as string | undefined) ??
    (metadata?.name as string | undefined);
  if (candidate && candidate.trim()) return candidate.trim();
  return email.split("@")[0] ?? email;
}

/**
 * Ambil user terautentikasi dari sesi terverifikasi, lalu sinkronkan ke
 * tabel User (Prisma). Mengembalikan null jika belum login.
 *
 * getClaims memverifikasi tanda tangan JWT, jadi aman dipercaya di server.
 * Di-cache per request agar tidak query berulang dalam satu render.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims?.sub || !claims.email) {
    return null;
  }

  const id = claims.sub;
  const email = claims.email as string;
  const metadata = claims.user_metadata as Record<string, unknown> | undefined;
  const name = resolveName(metadata, email);
  const avatarUrl =
    (metadata?.avatar_url as string | undefined) ??
    (metadata?.picture as string | undefined) ??
    null;

  // Upsert: sumber kebenaran identitas ada di Supabase Auth.
  return prisma.user.upsert({
    where: { id },
    create: { id, email, name, avatarUrl },
    update: { email, name, avatarUrl },
  });
});

/**
 * Sama seperti getCurrentUser tapi mengalihkan ke /login bila belum login.
 * Pakai di Server Component atau Server Action yang butuh user.
 */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
