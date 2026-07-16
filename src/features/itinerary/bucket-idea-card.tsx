"use client";

import { CalendarPlus, MapPin, Sparkle } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/money";
import { googleMapsUrl } from "@/features/maps/gmaps-url";
import { distanceLevel, formatDistanceKm } from "@/features/maps/distance";
import { CATEGORY_META } from "./categories";
import type { BoardItem } from "./types";

export type BucketDayChoice = {
  id: string;
  label: string;
  distanceKm: number | null;
  nearestPlace: string | null;
};

export function BucketIdeaCard({
  item,
  currency,
  days,
  pending,
  onSchedule,
  onEdit,
}: {
  item: BoardItem;
  currency: string;
  days: BucketDayChoice[];
  pending: boolean;
  onSchedule: (itemId: string, dayId: string) => void;
  onEdit: (item: BoardItem) => void;
}) {
  const meta = CATEGORY_META[item.category];
  const Icon = meta.icon;
  const best = days
    .filter(
      (day): day is BucketDayChoice & { distanceKm: number } =>
        day.distanceKm !== null,
    )
    .sort((a, b) => a.distanceKm - b.distanceKm)[0];
  const level = best ? distanceLevel(best.distanceKm) : null;
  const hasMapLink =
    Boolean(item.place.googleMapsUrl) ||
    (item.place.lat !== null && item.place.lng !== null);

  return (
    <article className="doodle-box border border-white/70 bg-white p-3 shadow-[0_10px_30px_rgba(15,118,110,0.08)] transition-all duration-300 ease-in-out hover:border-slate-200/70">
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="min-h-11 min-w-0 flex-1 doodle-sticker text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
        >
          <span className="flex items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center doodle-sticker bg-neutral-100 text-neutral-500">
              <Icon className="size-4" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-semibold text-neutral-900">
                {item.place.name}
              </span>
              <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
                <Badge variant={meta.badge}>{meta.label}</Badge>
                {item.estimatedCost !== null ? (
                  <span className="text-[12px] tabular-nums text-neutral-500">
                    {formatMoney(item.estimatedCost, currency)}
                  </span>
                ) : null}
              </span>
            </span>
          </span>
          {item.place.address ? (
            <span className="mt-2 block line-clamp-2 text-[12px] leading-5 text-neutral-500">
              {item.place.address}
            </span>
          ) : null}
          {item.note ? (
            <span className="mt-1 block line-clamp-2 text-[12px] leading-5 text-neutral-500">
              {item.note}
            </span>
          ) : null}
        </button>

        {hasMapLink ? (
          <a
            href={googleMapsUrl({
              sourceUrl: item.place.googleMapsUrl,
              lat: item.place.lat,
              lng: item.place.lng,
              name: item.place.name,
            })}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Buka ${item.place.name} di Google Maps`}
            title="Buka link Google Maps asli"
            className="flex size-11 shrink-0 items-center justify-center doodle-sticker text-neutral-400 hover:bg-teal-50 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            <MapPin className="size-4" aria-hidden />
          </a>
        ) : null}
      </div>

      {best ? (
        <div className="mt-3 flex items-start gap-2 doodle-sticker bg-sand-50 px-2.5 py-2">
          <Sparkle
            className="mt-0.5 size-4 shrink-0 text-sand-500"
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-neutral-700">
                Saran terdekat: {best.label}
              </span>
              <Badge
                variant={
                  level === "NEAR"
                    ? "success"
                    : level === "MEDIUM"
                      ? "warning"
                      : "danger"
                }
              >
                {formatDistanceKm(best.distanceKm)}
              </Badge>
            </div>
            <p className="mt-0.5 text-[11px] leading-4 text-neutral-500">
              Dibandingkan dengan {best.nearestPlace}. Jarak masih berupa garis
              lurus.
            </p>
          </div>
        </div>
      ) : null}

      <div className="mt-3 border-t border-neutral-100 pt-3">
        <label
          htmlFor={`schedule-${item.id}`}
          className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500"
        >
          <CalendarPlus className="size-4" aria-hidden />
          Pilih hari
        </label>
        <select
          id={`schedule-${item.id}`}
          value=""
          disabled={pending || days.length === 0}
          onChange={(event) => {
            const dayId = event.target.value;
            if (dayId) onSchedule(item.id, dayId);
          }}
          className="min-h-11 w-full doodle-box-alt border border-white/70 bg-white px-3 text-[14px] font-medium text-neutral-800 outline-none transition-all duration-300 ease-in-out hover:border-slate-200/70 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">
            {pending
              ? "Memindahkan..."
              : days.length > 0
                ? "Jadwalkan ke..."
                : "Belum ada hari"}
          </option>
          {days.map((day) => (
            <option key={day.id} value={day.id}>
              {day.label}
              {day.distanceKm !== null
                ? ` · ${formatDistanceKm(day.distanceKm)}`
                : ""}
            </option>
          ))}
        </select>
      </div>
    </article>
  );
}
