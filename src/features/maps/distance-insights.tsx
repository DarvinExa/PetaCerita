"use client";

import { MapPin, Path, WarningCircle } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import {
  distanceLevel,
  formatDistanceKm,
  nearestPoint,
  routeSegments,
  totalHaversineKm,
  type GeoPoint,
} from "./distance";

export type DayPointGroup = {
  id: string;
  label: string;
  points: GeoPoint[];
};

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
        <span className="inline-flex items-center gap-1.5 rounded-md bg-sky-50 px-2 py-1 font-medium text-sky-500">
          <Path className="size-4" aria-hidden />
          Total garis lurus {formatDistanceKm(totalHaversineKm(points))}
        </span>
        <span>{segments.length} perpindahan</span>
      </div>
      {warnings.map((segment) => (
        <div
          key={`${segment.from.id}:${segment.to.id}`}
          className="flex gap-2 rounded-md border border-warning/25 bg-warning/5 px-2.5 py-2 text-[12px] leading-5 text-neutral-700"
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

export function BucketDistanceInsights({
  candidates,
  days,
}: {
  candidates: GeoPoint[];
  days: DayPointGroup[];
}) {
  const scheduled = days.filter((day) => day.points.length > 0);
  if (candidates.length === 0 || scheduled.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
        Kecocokan kandidat
      </h3>
      {candidates.map((candidate) => {
        const options = scheduled
          .map((day) => {
            const nearest = nearestPoint(candidate, day.points);
            return nearest ? { day, ...nearest } : null;
          })
          .filter((option): option is NonNullable<typeof option> =>
            Boolean(option),
          )
          .sort((a, b) => a.distanceKm - b.distanceKm);
        const best = options[0];
        if (!best) return null;
        const level = distanceLevel(best.distanceKm);
        return (
          <div
            key={candidate.id}
            className="rounded-md border border-neutral-200 bg-white px-2.5 py-2"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="inline-flex min-w-0 items-center gap-1.5 text-[12px] font-medium text-neutral-800">
                <MapPin
                  className="size-3.5 shrink-0 text-neutral-400"
                  aria-hidden
                />
                <span className="truncate">{candidate.name}</span>
              </span>
              <Badge
                variant={
                  level === "NEAR"
                    ? "success"
                    : level === "MEDIUM"
                      ? "warning"
                      : "danger"
                }
                className="shrink-0"
              >
                {formatDistanceKm(best.distanceKm)}
              </Badge>
            </div>
            <p className="mt-1 text-[11px] leading-4 text-neutral-500">
              Paling dekat dengan {best.day.label}, sekitar {best.point.name}.
              {level === "FAR"
                ? " Kandidat ini jauh dari rute yang sudah ada."
                : ""}
            </p>
          </div>
        );
      })}
      <p className="text-[11px] leading-4 text-neutral-400">
        Jarak dihitung garis lurus. Waktu dan jarak berkendara dapat berbeda.
      </p>
    </div>
  );
}
