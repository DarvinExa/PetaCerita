import "server-only";
import { serverEnv, publicEnv } from "@/lib/env";

/**
 * Broadcast realtime untuk kolaborasi (M6). Model: server mengirim "nudge"
 * tanpa data ("trip X berubah") ke channel per-trip lewat Realtime REST API;
 * client yang mendengarkan lalu memanggil router.refresh() untuk menarik ulang
 * data server-rendered (yang tetap tergating requireTripMember).
 *
 * Kenapa Broadcast, bukan postgres_changes: skema ini memakai RLS deny-all agar
 * Supabase Data API tertutup total, dan Prisma (role postgres) bypass RLS.
 * postgres_changes butuh policy SELECT agar anon client bisa membaca row, yang
 * akan membongkar model keamanan itu. Broadcast murni pub/sub, tidak membaca
 * tabel, jadi tidak butuh policy apa pun dan deny-all tetap utuh.
 *
 * Channel bersifat public + di-key dengan UUID trip: payload tidak pernah berisi
 * data, hanya penanda perubahan. UUID tidak bisa ditebak dan hanya anggota yang
 * punya link trip, jadi deny-all tetap utuh tanpa policy tambahan.
 */

/** Nama channel/topik broadcast untuk sebuah trip. */
export function tripChannel(tripId: string): string {
  return `trip:${tripId}`;
}

/** Kategori area yang berubah, agar client bisa memfilter refresh bila perlu. */
export type TripChangeScope = "itinerary" | "bill";

/**
 * Kirim nudge perubahan ke semua anggota yang sedang membuka trip. Best-effort:
 * kegagalan broadcast TIDAK boleh menggagalkan mutation yang sudah sukses, jadi
 * error hanya di-log, tidak dilempar. Dipanggil setelah write berhasil.
 */
export async function broadcastTripChange(
  tripId: string,
  scope: TripChangeScope,
): Promise<void> {
  try {
    const url = `${publicEnv.supabaseUrl}/realtime/v1/api/broadcast`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serverEnv.supabaseServiceRoleKey,
        Authorization: `Bearer ${serverEnv.supabaseServiceRoleKey}`,
      },
      body: JSON.stringify({
        messages: [
          {
            topic: tripChannel(tripId),
            event: "changed",
            payload: { scope },
          },
        ],
      }),
      // Jangan cache; ini efek samping.
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(
        `broadcastTripChange gagal (${res.status}) untuk trip ${tripId}`,
      );
    }
  } catch (err) {
    console.error("broadcastTripChange error:", err);
  }
}
