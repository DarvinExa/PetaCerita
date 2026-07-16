"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Clock } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { SortableItem } from "./sortable-item";
import type { BoardItem } from "./types";

const HOURS = Array.from({ length: 18 }, (_, index) => index + 6);

function hourOf(time: string | null): number | null {
  if (!time) return null;
  const hour = Number(time.slice(0, 2));
  return Number.isInteger(hour) ? Math.max(6, Math.min(23, hour)) : null;
}

export function DayTimeline({
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
  const byHour = new Map<number, BoardItem[]>();
  const unscheduled: BoardItem[] = [];

  for (const item of items) {
    const hour = hourOf(item.startTime);
    if (hour === null) unscheduled.push(item);
    else {
      const hourItems = byHour.get(hour) ?? [];
      hourItems.push(item);
      byHour.set(hour, hourItems);
    }
  }

  return (
    <SortableContext
      items={items.map((item) => item.id)}
      strategy={verticalListSortingStrategy}
    >
      <div
        ref={setNodeRef}
        className={cn(
          "overflow-hidden rounded-md border border-neutral-200 bg-white transition-colors",
          isOver && "border-teal-300 ring-2 ring-teal-100",
        )}
      >
        {HOURS.map((hour) => {
          const hourItems = byHour.get(hour) ?? [];
          return (
            <div
              key={hour}
              className="grid min-h-[68px] grid-cols-[56px_1fr] border-b border-neutral-100 last:border-b-0"
            >
              <div className="border-r border-neutral-100 bg-neutral-50 px-2 pt-3 text-right text-[11px] font-semibold tabular-nums text-neutral-400">
                {String(hour).padStart(2, "0")}:00
              </div>
              <div className="relative flex flex-col gap-2 p-2">
                <span
                  className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-neutral-100"
                  aria-hidden
                />
                {hourItems.map((item) => (
                  <div
                    key={item.id}
                    id={`itinerary-item-${item.id}`}
                    className="relative z-10 scroll-mt-24"
                  >
                    <SortableItem
                      item={item}
                      currency={currency}
                      onEdit={onEdit}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div className="grid min-h-24 grid-cols-[56px_1fr] border-t border-neutral-200 bg-sand-50">
          <div className="flex justify-center border-r border-sand-200 pt-4 text-sand-500">
            <Clock className="size-4" aria-hidden />
          </div>
          <div className="p-2">
            <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
              Waktu belum ditentukan
            </p>
            <div className="flex flex-col gap-2">
              {unscheduled.length > 0 ? (
                unscheduled.map((item) => (
                  <div
                    key={item.id}
                    id={`itinerary-item-${item.id}`}
                    className="scroll-mt-24"
                  >
                    <SortableItem
                      item={item}
                      currency={currency}
                      onEdit={onEdit}
                    />
                  </div>
                ))
              ) : (
                <p className="px-1 pb-2 text-[13px] text-neutral-500">
                  Geser tempat ke hari ini, lalu atur waktunya.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </SortableContext>
  );
}
