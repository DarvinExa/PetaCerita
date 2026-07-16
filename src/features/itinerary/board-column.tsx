"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/cn";
import { SortableItem } from "./sortable-item";
import type { BoardItem } from "./types";

/**
 * Satu kolom papan: Bucket Ide atau satu hari. Membungkus daftar item dalam
 * SortableContext dan mendaftarkan dirinya sebagai droppable sehingga item bisa
 * dijatuhkan ke kolom kosong sekalipun. containerId dipakai untuk menghitung
 * tujuan saat drag berakhir (BUCKET_ID untuk Bucket, id hari untuk hari).
 */
export function BoardColumn({
  containerId,
  items,
  currency,
  emptyLabel,
  onEdit,
}: {
  containerId: string;
  items: BoardItem[];
  currency: string;
  emptyLabel: string;
  onEdit: (item: BoardItem) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: containerId });

  return (
    <SortableContext
      items={items.map((i) => i.id)}
      strategy={verticalListSortingStrategy}
    >
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-24 flex-col gap-2 rounded-md p-2 transition-colors",
          isOver ? "bg-teal-50 ring-1 ring-teal-200" : "bg-transparent",
        )}
      >
        {items.length === 0 ? (
          <p className="flex flex-1 items-center justify-center px-2 py-6 text-center text-[13px] text-neutral-400">
            {emptyLabel}
          </p>
        ) : (
          items.map((item) => (
            <SortableItem
              key={item.id}
              item={item}
              currency={currency}
              onEdit={onEdit}
            />
          ))
        )}
      </div>
    </SortableContext>
  );
}
