"use client";

import { useState } from "react";
import {
  CaretLeft,
  CaretRight,
  Clock,
  MapPin,
  MapTrifold,
} from "@phosphor-icons/react";
import { googleMapsUrl } from "@/features/maps/gmaps-url";
import { cn } from "@/lib/cn";

export type TripDayOverviewData = {
  id: string;
  date: string;
  items: Array<{
    id: string;
    startTime: string | null;
    endTime: string | null;
    note: string | null;
    place: {
      name: string;
      address: string | null;
      note: string | null;
      lat: number | null;
      lng: number | null;
      googleMapsUrl: string | null;
    };
  }>;
};

const dayFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

function formatTime(startTime: string | null, endTime: string | null) {
  if (startTime && endTime) return `${startTime} sampai ${endTime}`;
  if (startTime) return `Mulai ${startTime}`;
  if (endTime) return `Selesai ${endTime}`;
  return "Waktu belum diatur";
}

export function TripDayOverview({ days }: { days: TripDayOverviewData[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeIndex = Math.min(activeIndex, Math.max(days.length - 1, 0));
  const activeDay = days[safeIndex];

  if (!activeDay) {
    return (
      <div className="doodle-box px-5 py-10 text-center text-[15px] text-neutral-600">
        Belum ada hari perjalanan.
      </div>
    );
  }

  return (
    <div className="doodle-box overflow-hidden p-0">
      <div className="border-b-2 border-dashed border-slate-300 bg-sand-50 px-4 py-4 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            className="doodle-button flex size-11 shrink-0 items-center justify-center bg-white text-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() =>
              setActiveIndex((current) => Math.max(0, current - 1))
            }
            disabled={safeIndex === 0}
            aria-label="Buka hari sebelumnya"
          >
            <CaretLeft className="size-5" weight="bold" aria-hidden />
          </button>

          <div className="min-w-0 text-center">
            <p className="highlighter-yellow inline-block -rotate-1 px-1 text-[13px] font-bold uppercase tracking-[0.08em] text-slate-800">
              Hari {safeIndex + 1} dari {days.length}
            </p>
            <h3 className="mt-1 text-[18px] font-bold text-slate-900">
              {dayFormatter.format(new Date(activeDay.date))}
            </h3>
            <p className="mt-0.5 text-[13px] font-bold text-slate-600">
              {activeDay.items.length} tempat direncanakan
            </p>
          </div>

          <button
            type="button"
            className="doodle-button flex size-11 shrink-0 items-center justify-center bg-white text-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() =>
              setActiveIndex((current) =>
                Math.min(days.length - 1, current + 1),
              )
            }
            disabled={safeIndex === days.length - 1}
            aria-label="Buka hari berikutnya"
          >
            <CaretRight className="size-5" weight="bold" aria-hidden />
          </button>
        </div>

        <div
          className="mt-4 flex gap-2 overflow-x-auto px-1 pb-2"
          role="tablist"
          aria-label="Pilih hari perjalanan"
        >
          {days.map((day, index) => (
            <button
              key={day.id}
              type="button"
              role="tab"
              aria-selected={index === safeIndex}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "doodle-button min-h-11 shrink-0 px-4 py-2 text-[14px] font-bold",
                index === safeIndex
                  ? "-rotate-1 bg-sand-200 text-slate-900"
                  : "bg-white text-slate-600 hover:text-slate-900",
              )}
            >
              Hari {index + 1}
            </button>
          ))}
        </div>
      </div>

      {activeDay.items.length > 0 ? (
        <div className="max-h-[580px] space-y-4 overflow-y-auto p-4 sm:p-5">
          {activeDay.items.map((item, index) => {
            const note = item.note?.trim() || item.place.note?.trim();
            const mapUrl = googleMapsUrl({
              sourceUrl: item.place.googleMapsUrl,
              lat: item.place.lat,
              lng: item.place.lng,
              name: item.place.name,
            });

            return (
              <article
                key={item.id}
                className={cn(
                  "doodle-box-alt doodle-lift relative p-4 sm:p-5",
                  index % 2 === 0 ? "rotate-[0.35deg]" : "-rotate-[0.35deg]",
                )}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <span className="doodle-sticker flex size-10 shrink-0 items-center justify-center bg-sky-100 text-[14px] font-bold text-slate-800">
                    {index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                      <div>
                        <h4 className="text-[17px] font-bold leading-snug text-slate-900">
                          {item.place.name}
                        </h4>
                        <p className="mt-1 flex items-center gap-1.5 text-[13px] font-bold text-slate-600">
                          <Clock className="size-4 shrink-0" aria-hidden />
                          {formatTime(item.startTime, item.endTime)}
                        </p>
                      </div>

                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="doodle-button inline-flex min-h-11 shrink-0 items-center justify-center gap-2 bg-white px-3 py-2 text-[13px] font-bold text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800"
                      >
                        <MapTrifold
                          className="size-4"
                          weight="bold"
                          aria-hidden
                        />
                        Buka Google Maps
                      </a>
                    </div>

                    {item.place.address ? (
                      <p className="mt-3 flex items-start gap-2 text-[14px] leading-relaxed text-slate-700">
                        <MapPin
                          className="mt-0.5 size-4 shrink-0 text-teal-700"
                          aria-hidden
                        />
                        <span>{item.place.address}</span>
                      </p>
                    ) : null}

                    {note ? (
                      <div className="mt-3 border-l-4 border-sand-200 bg-sand-50 px-3 py-2.5">
                        <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-slate-600">
                          Catatan
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-[14px] leading-relaxed text-slate-800">
                          {note}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-3 text-[13px] italic text-slate-500">
                        Belum ada catatan untuk rencana ini.
                      </p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="px-5 py-10 text-center">
          <p className="text-[15px] font-bold text-slate-700">
            Belum ada tempat untuk hari ini.
          </p>
          <p className="mt-1 text-[13px] text-slate-500">
            Tambahkan tempat melalui halaman susun itinerary.
          </p>
        </div>
      )}
    </div>
  );
}
