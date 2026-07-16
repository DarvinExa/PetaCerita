"use client";

import dynamic from "next/dynamic";
import { MapTrifold } from "@phosphor-icons/react";
import type { MapPoint } from "./trip-map-inner";

// Leaflet menyentuh window; render hanya di client tanpa SSR.
const TripMapInner = dynamic(
  () => import("./trip-map-inner").then((m) => m.TripMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[360px] w-full items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-[13px] text-neutral-400">
        Memuat peta...
      </div>
    ),
  },
);

/**
 * Peta trip: menampilkan pin semua tempat terjadwal yang punya koordinat. Bila
 * belum ada tempat berkoordinat, tampilkan ajakan alih-alih peta kosong.
 */
export function TripMap({ points }: { points: MapPoint[] }) {
  if (points.length === 0) {
    return (
      <div className="flex h-[200px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 text-center">
        <MapTrifold className="size-8 text-neutral-300" aria-hidden />
        <p className="text-[13px] text-neutral-500">
          Tambah tempat lewat link Google Maps untuk melihatnya di peta.
        </p>
      </div>
    );
  }
  return <TripMapInner points={points} />;
}
