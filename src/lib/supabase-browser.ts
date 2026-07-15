"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client untuk browser (Client Component).
 * Sesi disimpan di cookie sehingga bisa dibaca ulang oleh server.
 * Nilai NEXT_PUBLIC_* di-inline saat build, jadi dibaca langsung dari
 * process.env (tidak lewat src/lib/env.ts yang server-only).
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
