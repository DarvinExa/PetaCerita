import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { publicEnv, serverEnv } from "@/lib/env";

/**
 * Supabase client terikat sesi user lewat cookie httpOnly.
 * Pakai di Server Component, Route Handler, dan Server Action.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Dipanggil dari Server Component tanpa akses tulis cookie.
          // Middleware yang menyegarkan sesi menangani penulisan cookie.
        }
      },
    },
  });
}

/**
 * Supabase admin client dengan service role. Melewati RLS.
 * HANYA untuk operasi server tepercaya. Jangan pernah kirim ke browser.
 */
export function createSupabaseAdminClient() {
  return createClient(publicEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
