"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CalendarPlus, Clock } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { SortableItem } from "./sortable-item";
import type { BoardItem } from "./types";

function timeParts(item: BoardItem): {
  primary: string;
  secondary: string | null;
} {
  if (item.startTime && item.endTime) {
    return { primary: item.startTime, secondary: `s.d. ${item.endTime}` };
  }
  if (item.startTime) return { primary: item.startTime, secondary: "mulai" };
  if (item.endTime) return { primary: item.endTime, secondary: "selesai" };
  return { primary: "Fleksibel", secondary: null };
}

export function CompactDayAgenda({
  containerId,
  items,
  currency,
  onEdit,
}: {
  containerId: string;
  items: BoardItem[];
  currency: string;
  onEdit: (item: BoardItem) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: containerId });

  return (
    <SortableContext
      items={items.map((item) => item.id)}
      strategy={verticalListSortingStrategy}
    >
      <section
        ref={setNodeRef}
        aria-label="Urutan agenda hari ini"
        className={cn(
          "rounded-3xl border border-white/70 bg-white p-3 transition-all duration-300 ease-in-out sm:p-4",
          isOver && "border-teal-300 ring-2 ring-teal-100",
        )}
      >
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="text-[14px] font-semibold text-neutral-900">
              Urutan kunjungan
            </h3>
            <p className="mt-0.5 text-[12px] leading-5 text-neutral-500">
              Geser kartu untuk mengurutkan. Klik kartu untuk mengatur jamnya.
            </p>
          </div>
          {items.length > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-2xl bg-neutral-100 px-2 py-1 text-[11px] font-medium text-neutral-600">
              <Clock className="size-3.5" aria-hidden />
              {items.length} agenda
            </span>
          ) : null}
        </div>

        {items.length === 0 ? (
          <div className="flex min-h-36 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/70 bg-neutral-50 px-4 text-center">
            <CalendarPlus className="size-7 text-neutral-300" aria-hidden />
            <p className="mt-2 text-[13px] font-medium text-neutral-700">
              Hari ini masih kosong
            </p>
            <p className="mt-1 max-w-sm text-[12px] leading-5 text-neutral-500">
              Pilih hari pada salah satu tempat di Bucket Ide untuk mulai
              menyusun agenda.
            </p>
          </div>
        ) : (
          <ol className="flex flex-col">
            {items.map((item, index) => {
              const time = timeParts(item);
              const isLast = index === items.length - 1;
              return (
                <li
                  key={item.id}
                  id={`itinerary-item-${item.id}`}
                  className="grid scroll-mt-24 grid-cols-[58px_18px_minmax(0,1fr)] gap-2 sm:grid-cols-[72px_20px_minmax(0,1fr)] sm:gap-3"
                >
                  <div className="pt-3 text-right tabular-nums">
                    <span
                      className={cn(
                        "block text-[12px] font-semibold",
                        item.startTime || item.endTime
                          ? "text-neutral-800"
                          : "text-neutral-500",
                      )}
                    >
                      {time.primary}
                    </span>
                    {time.secondary ? (
                      <span className="mt-0.5 block text-[10px] text-neutral-400">
                        {time.secondary}
                      </span>
                    ) : null}
                  </div>

                  <div className="relative flex justify-center">
                    {!isLast ? (
                      <span
                        className="absolute bottom-0 top-5 w-px bg-neutral-200"
                        aria-hidden
                      />
                    ) : null}
                    <span className="relative mt-4 flex size-4 items-center justify-center rounded-full border-2 border-white bg-teal-700 shadow-[0_10px_30px_rgba(15,118,110,0.08)] ring-1 ring-teal-200">
                      <span className="size-1 rounded-full bg-white" />
                    </span>
                  </div>

                  <div className={cn("pb-3", !isLast && "pb-4")}>
                    <SortableItem
                      item={item}
                      currency={currency}
                      onEdit={onEdit}
                    />
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </SortableContext>
  );
}
