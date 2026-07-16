"use client";

import { useMemo, useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Lightbulb, CalendarBlank } from "@phosphor-icons/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { moveItem } from "./actions";
import { BoardColumn } from "./board-column";
import { SortableItem } from "./sortable-item";
import { EditItemDialog } from "./edit-item-dialog";
import { AddPlaceForm } from "./add-place-form";
import { BUCKET_ID, containerOf, type BoardDay, type BoardItem } from "./types";

type Containers = Record<string, string[]>;

/** Bangun map kontainer -> daftar itemId terurut, dari daftar item mentah. */
function groupItems(items: BoardItem[], dayIds: string[]): Containers {
  const map: Containers = { [BUCKET_ID]: [] };
  for (const id of dayIds) map[id] = [];
  const sorted = [...items].sort((a, b) => a.order - b.order);
  for (const item of sorted) {
    const key = containerOf(item.dayId);
    (map[key] ??= []).push(item.id);
  }
  return map;
}

/** Kunci identitas untuk mendeteksi perubahan data dari server. */
function signature(items: BoardItem[]): string {
  return items
    .map((i) => `${i.id}:${i.dayId ?? "_"}:${i.order}`)
    .sort()
    .join("|");
}

export function ItineraryBoard({
  tripId,
  currency,
  days,
  items,
}: {
  tripId: string;
  currency: string;
  days: BoardDay[];
  items: BoardItem[];
}) {
  const { notify } = useToast();
  const [, startTransition] = useTransition();

  const dayIds = useMemo(() => days.map((d) => d.id), [days]);
  const itemsById = useMemo(() => {
    const map = new Map<string, BoardItem>();
    for (const item of items) map.set(item.id, item);
    return map;
  }, [items]);

  // State kontainer optimistis. Disinkronkan ulang saat data server berubah
  // (mis. setelah revalidate): pola "adjust state on prop change" dari React,
  // membandingkan signature data lama vs baru selama render.
  const [containers, setContainers] = useState<Containers>(() =>
    groupItems(items, dayIds),
  );
  const currentSignature = signature(items);
  const [lastSignature, setLastSignature] = useState(currentSignature);
  if (currentSignature !== lastSignature) {
    setLastSignature(currentSignature);
    setContainers(groupItems(items, dayIds));
  }

  const [activeId, setActiveId] = useState<string | null>(null);
  const [editing, setEditing] = useState<BoardItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  /** Cari kontainer yang memuat sebuah id (item) atau id kontainer itu sendiri. */
  function findContainer(id: string): string | undefined {
    if (id in containers) return id;
    return Object.keys(containers).find((key) =>
      (containers[key] ?? []).includes(id),
    );
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  /** Pindahkan item antar kontainer secara live saat digeser melewati batas. */
  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeItemId = String(active.id);
    const overId = String(over.id);

    const from = findContainer(activeItemId);
    const to = findContainer(overId);
    if (!from || !to || from === to) return;

    setContainers((prev) => {
      const fromItems = (prev[from] ?? []).filter((id) => id !== activeItemId);
      const toItems = [...(prev[to] ?? [])];
      // Sisipkan sebelum item yang sedang di-hover, atau di akhir bila hover
      // langsung di area kontainer kosong.
      const overIndex = toItems.indexOf(overId);
      const insertAt = overIndex >= 0 ? overIndex : toItems.length;
      toItems.splice(insertAt, 0, activeItemId);
      return { ...prev, [from]: fromItems, [to]: toItems };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeItemId = String(active.id);
    const overId = String(over.id);
    const to = findContainer(overId);
    if (!to) return;

    // Susun urutan akhir dalam kontainer tujuan.
    let finalContainers = containers;
    setContainers((prev) => {
      const toItems = prev[to] ?? [];
      const oldIndex = toItems.indexOf(activeItemId);
      const overIndex =
        overId === to ? toItems.length - 1 : toItems.indexOf(overId);
      let next = prev;
      if (oldIndex !== -1 && overIndex !== -1 && oldIndex !== overIndex) {
        next = { ...prev, [to]: arrayMove(toItems, oldIndex, overIndex) };
      }
      finalContainers = next;
      return next;
    });

    const toIndex = (finalContainers[to] ?? []).indexOf(activeItemId);
    const toDayId = to === BUCKET_ID ? null : to;
    if (toIndex < 0) return;

    // Persist. Bila gagal, kembalikan ke keadaan server dan beri tahu.
    startTransition(async () => {
      const result = await moveItem({
        tripId,
        itemId: activeItemId,
        toDayId,
        toIndex,
      });
      if (result?.error) {
        notify({ tone: "danger", title: result.error });
        setContainers(groupItems(items, dayIds));
      }
    });
  }

  function renderColumn(containerId: string, emptyLabel: string) {
    const columnItems = (containers[containerId] ?? [])
      .map((id) => itemsById.get(id))
      .filter((i): i is BoardItem => Boolean(i));
    return (
      <BoardColumn
        containerId={containerId}
        items={columnItems}
        currency={currency}
        emptyLabel={emptyLabel}
        onEdit={setEditing}
      />
    );
  }

  const dayFmt = new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

  const activeItem = activeId ? itemsById.get(activeId) : null;

  const bucketPanel = (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-neutral-500">
          <Lightbulb className="size-4" aria-hidden />
          Bucket Ide
        </h2>
        <AddPlaceForm tripId={tripId} />
      </div>
      <div className="rounded-md border border-neutral-200 bg-neutral-100 p-2">
        {renderColumn(
          BUCKET_ID,
          "Belum ada kandidat. Tambah tempat, lalu geser ke hari.",
        )}
      </div>
    </section>
  );

  const daysPanel = (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-neutral-500">
        <CalendarBlank className="size-4" aria-hidden />
        Jadwal harian
      </h2>
      <div className="flex flex-col gap-3">
        {days.map((day, index) => (
          <div
            key={day.id}
            className="rounded-md border border-neutral-200 bg-neutral-100 p-2"
          >
            <div className="flex items-baseline justify-between px-1 pb-1">
              <span className="text-[13px] font-semibold text-teal-700">
                Hari {index + 1}
              </span>
              <span className="text-[13px] text-neutral-500">
                {dayFmt.format(day.date)}
              </span>
            </div>
            {renderColumn(day.id, "Geser tempat ke sini")}
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        {/* Desktop: dua panel berdampingan. */}
        <div className="hidden gap-6 lg:grid lg:grid-cols-[minmax(280px,360px)_1fr]">
          {bucketPanel}
          {daysPanel}
        </div>

        {/* Mobile: tab bertumpuk. */}
        <div className="lg:hidden">
          <Tabs defaultValue="bucket">
            <TabsList className="w-full">
              <TabsTrigger value="bucket" className="flex-1">
                Bucket Ide
              </TabsTrigger>
              <TabsTrigger value="days" className="flex-1">
                Jadwal
              </TabsTrigger>
            </TabsList>
            <TabsContent value="bucket">{bucketPanel}</TabsContent>
            <TabsContent value="days">{daysPanel}</TabsContent>
          </Tabs>
        </div>

        <DragOverlay>
          {activeItem ? (
            <SortableItem
              item={activeItem}
              currency={currency}
              onEdit={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <EditItemDialog
        item={editing}
        tripId={tripId}
        onClose={() => setEditing(null)}
      />
    </>
  );
}
