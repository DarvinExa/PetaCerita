"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Clock, DotsSixVertical } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/money";
import { CATEGORY_META } from "./categories";
import type { BoardItem } from "./types";

/** Rentang waktu ringkas, mis. "09:00 - 11:00", "mulai 09:00", atau kosong. */
function timeLabel(item: BoardItem): string | null {
  if (item.startTime && item.endTime)
    return `${item.startTime} - ${item.endTime}`;
  if (item.startTime) return `mulai ${item.startTime}`;
  if (item.endTime) return `selesai ${item.endTime}`;
  return null;
}

/**
 * Kartu item yang bisa di-drag (satu tempat dalam Bucket atau hari). Klik kartu
 * membuka dialog edit; handle titik enam khusus untuk drag. Sensor pointer
 * memakai jarak aktivasi, jadi klik singkat tidak memicu drag.
 */
export function SortableItem({
  item,
  currency,
  onEdit,
}: {
  item: BoardItem;
  currency: string;
  onEdit: (item: BoardItem) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, data: { containerId: item.dayId } });

  const meta = CATEGORY_META[item.category];
  const Icon = meta.icon;
  const time = timeLabel(item);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "group flex items-start gap-2 rounded-md border border-neutral-200 bg-white p-3 shadow-sm",
        isDragging && "opacity-50",
      )}
    >
      <button
        type="button"
        aria-label="Geser untuk memindahkan"
        className="mt-0.5 cursor-grab touch-none rounded p-0.5 text-neutral-300 hover:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <DotsSixVertical className="size-4" aria-hidden />
      </button>

      <button
        type="button"
        onClick={() => onEdit(item)}
        className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 rounded"
      >
        <div className="flex items-center gap-1.5">
          <Icon className="size-4 shrink-0 text-neutral-400" aria-hidden />
          <span className="truncate text-[15px] font-medium text-neutral-900">
            {item.place.name}
          </span>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          <Badge variant={meta.badge}>{meta.label}</Badge>
          {time ? (
            <span className="inline-flex items-center gap-1 text-[13px] text-neutral-600 tabular-nums">
              <Clock className="size-3.5 text-neutral-400" aria-hidden />
              {time}
            </span>
          ) : null}
          {item.estimatedCost !== null ? (
            <span className="text-[13px] text-neutral-600 tabular-nums">
              {formatMoney(item.estimatedCost, currency)}
            </span>
          ) : null}
        </div>
        {item.note ? (
          <p className="mt-1 line-clamp-2 text-[13px] text-neutral-500">
            {item.note}
          </p>
        ) : null}
      </button>
    </div>
  );
}
