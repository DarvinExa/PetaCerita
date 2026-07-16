"use client";

import { Path, WarningCircle } from "@phosphor-icons/react";
import {
  distanceLevel,
  formatDistanceKm,
  routeSegments,
  totalHaversineKm,
  type GeoPoint,
} from "./distance";

export function DayDistanceSummary({ points }: { points: GeoPoint[] }) {
  const segments = routeSegments(points);
  const warnings = segments.filter(
    (segment) => distanceLevel(segment.distanceKm) === "FAR",
  );

  if (points.length < 2) {
    return (
      <p className="text-[12px] text-neutral-500">
        Tambahkan minimal dua tempat berkoordinat untuk menghitung jarak.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2 text-[12px] text-neutral-600">
        <span className="inline-flex items-center gap-1.5 rounded-2xl bg-sky-50 px-2 py-1 font-medium text-sky-500">
          <Path className="size-4" aria-hidden />
          Total garis lurus {formatDistanceKm(totalHaversineKm(points))}
        </span>
        <span>{segments.length} perpindahan</span>
      </div>
      {warnings.map((segment) => (
        <div
          key={`${segment.from.id}:${segment.to.id}`}
          className="flex gap-2 rounded-2xl border border-warning/25 bg-warning/5 px-2.5 py-2 text-[12px] leading-5 text-neutral-700"
        >
          <WarningCircle
            className="mt-0.5 size-4 shrink-0 text-warning"
            aria-hidden
          />
          <span>
            {segment.from.name} ke {segment.to.name} berjarak sekitar{" "}
            <strong>{formatDistanceKm(segment.distanceKm)}</strong>. Urutan ini
            mungkin kurang efisien.
          </span>
        </div>
      ))}
    </div>
  );
}
