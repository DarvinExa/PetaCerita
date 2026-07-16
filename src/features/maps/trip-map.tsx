"use client";

import dynamic from "next/dynamic";
import { MapTrifold } from "@phosphor-icons/react";
import type { MapPoint } from "./trip-map-inner";

const TripMapInner = dynamic(
  () => import("./trip-map-inner").then((module) => module.TripMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[240px] w-full items-center justify-center rounded-2xl border border-white/70 bg-neutral-50 text-[13px] text-neutral-400">
        Memuat peta...
      </div>
    ),
  },
);

export function TripMap({
  points,
  showPath = false,
  emptyLabel = "Tambahkan tempat berkoordinat untuk melihat peta.",
}: {
  points: MapPoint[];
  showPath?: boolean;
  emptyLabel?: string;
}) {
  if (points.length === 0) {
    return (
      <div className="flex h-[180px] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200/70 bg-neutral-50 px-4 text-center">
        <MapTrifold className="size-7 text-neutral-300" aria-hidden />
        <p className="max-w-xs text-[12px] leading-5 text-neutral-500">
          {emptyLabel}
        </p>
      </div>
    );
  }
  return <TripMapInner points={points} showPath={showPath} />;
}
