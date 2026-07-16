"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { TripChangeScope } from "@/server/realtime";

/**
 * Berlangganan nudge perubahan untuk sebuah trip lalu menyegarkan data server
 * (router.refresh()) saat ada perubahan dari anggota lain (M6). Channel public
 * di-key dengan UUID trip; payload hanya penanda scope, tidak ada data, jadi
 * model keamanan deny-all tetap utuh (lihat src/server/realtime.ts).
 *
 * `scope` opsional: bila diberikan, hanya nudge dengan scope sama yang memicu
 * refresh (mis. halaman itinerary abaikan perubahan bill). Tanpa scope, semua
 * perubahan trip memicu refresh.
 */
export function useTripRealtime(tripId: string, scope?: TripChangeScope): void {
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase.channel(`trip:${tripId}`);

    channel
      .on("broadcast", { event: "changed" }, (message) => {
        const payload = message.payload as
          { scope?: TripChangeScope } | undefined;
        const changed = payload?.scope;
        // Filter berdasarkan scope bila halaman menentukannya.
        if (scope && changed && changed !== scope) return;
        router.refresh();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [tripId, scope, router]);
}
