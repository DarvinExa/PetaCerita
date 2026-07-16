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
import { DayTimeline } from "./day-timeline";
import { SortableItem } from "./sortable-item";
import { EditItemDialog } from "./edit-item-dialog";
import { AddPlaceForm } from "./add-place-form";
import { useTripRealtime } from "@/features/realtime/use-trip-realtime";
import { TripMap } from "@/features/maps/trip-map";
import type { MapPoint } from "@/features/maps/trip-map-inner";
import {
  BucketDistanceInsights,
  DayDistanceSummary,
  type DayPointGroup,
} from "@/features/maps/distance-insights";
import type { GeoPoint } from "@/features/maps/distance";
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

  // Segarkan papan saat anggota lain mengubah itinerary trip ini.
  useTripRealtime(tripId, "itinerary");

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

    // Hitung state akhir secara sinkron. Jangan membaca nilai yang diubah dari
    // callback setState karena callback dapat berjalan setelah persist dimulai.
    const toItems = containers[to] ?? [];
    const oldIndex = toItems.indexOf(activeItemId);
    const overIndex =
      overId === to ? toItems.length - 1 : toItems.indexOf(overId);
    const finalContainers =
      oldIndex !== -1 && overIndex !== -1 && oldIndex !== overIndex
        ? { ...containers, [to]: arrayMove(toItems, oldIndex, overIndex) }
        : containers;
    setContainers(finalContainers);

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
    const columnItems = itemsFor(containerId);
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

  function renderTimeline(containerId: string) {
    const timelineItems = itemsFor(containerId);
    return (
      <DayTimeline
        containerId={containerId}
        items={timelineItems}
        currency={currency}
        onEdit={setEditing}
      />
    );
  }

  function itemsFor(containerId: string): BoardItem[] {
    return (containers[containerId] ?? [])
      .map((id) => itemsById.get(id))
      .filter((item): item is BoardItem => Boolean(item));
  }

  function geoPointsFor(containerId: string): GeoPoint[] {
    return itemsFor(containerId)
      .filter((item) => item.place.lat !== null && item.place.lng !== null)
      .map((item) => ({
        id: item.id,
        name: item.place.name,
        lat: item.place.lat as number,
        lng: item.place.lng as number,
      }));
  }

  function mapPointsFor(containerId: string): MapPoint[] {
    return itemsFor(containerId)
      .filter((item) => item.place.lat !== null && item.place.lng !== null)
      .map((item, index) => ({
        id: item.id,
        name: item.place.name,
        address: item.place.address,
        lat: item.place.lat as number,
        lng: item.place.lng as number,
        label: String(index + 1),
        targetId: `itinerary-item-${item.id}`,
      }));
  }

  const dayFmt = new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

  const activeItem = activeId ? itemsById.get(activeId) : null;
  const bucketMapPoints = mapPointsFor(BUCKET_ID);
  const bucketGeoPoints = geoPointsFor(BUCKET_ID);
  const dayPointGroups: DayPointGroup[] = days.map((day, index) => ({
    id: day.id,
    label: `Hari ${index + 1}, ${dayFmt.format(day.date)}`,
    points: geoPointsFor(day.id),
  }));

  const bucketPanel = (
    <section className="flex flex-col gap-3 lg:self-start">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-neutral-500">
          <Lightbulb className="size-4" aria-hidden />
          Bucket Ide
        </h2>
        <AddPlaceForm tripId={tripId} />
      </div>
      <div className="rounded-lg border border-neutral-200 bg-white p-2 shadow-sm">
        {renderColumn(
          BUCKET_ID,
          "Belum ada kandidat. Tambah tempat, lalu geser ke hari.",
        )}
      </div>
      <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-3 shadow-sm">
        <div>
          <h3 className="text-[12px] font-semibold text-neutral-800">
            Peta kandidat
          </h3>
          <p className="mt-0.5 text-[11px] leading-4 text-neutral-500">
            Bandingkan posisi kandidat dengan rute harian yang sudah disusun.
          </p>
        </div>
        <TripMap
          points={bucketMapPoints}
          emptyLabel="Kandidat dengan koordinat akan muncul di peta ini."
        />
        <BucketDistanceInsights
          candidates={bucketGeoPoints}
          days={dayPointGroups}
        />
      </div>
    </section>
  );

  const daysPanel = (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-neutral-500">
        <CalendarBlank className="size-4" aria-hidden />
        Jadwal harian
      </h2>
      <div className="flex flex-col gap-5">
        {days.map((day, index) => {
          const dayMapPoints = mapPointsFor(day.id);
          const dayGeoPoints = geoPointsFor(day.id);
          return (
            <div
              key={day.id}
              className="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 p-3 shadow-sm sm:p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3 px-1">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-md bg-teal-800 text-[13px] font-bold tabular-nums text-white">
                    {index + 1}
                  </span>
                  <div>
                    <span className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-teal-700">
                      Hari {index + 1}
                    </span>
                    <span className="block text-[14px] font-semibold text-neutral-900">
                      {dayFmt.format(day.date)}
                    </span>
                  </div>
                </div>
                <span className="rounded-md bg-white px-2 py-1 text-[12px] font-medium text-neutral-500 shadow-sm">
                  {(containers[day.id] ?? []).length} tempat
                </span>
              </div>
              <div className="mb-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_240px]">
                <TripMap
                  points={dayMapPoints}
                  showPath
                  emptyLabel="Tempat berkoordinat pada hari ini akan muncul sebagai rute."
                />
                <div className="rounded-md border border-neutral-200 bg-white p-3">
                  <h3 className="mb-2 text-[12px] font-semibold text-neutral-800">
                    Ringkasan jarak
                  </h3>
                  <DayDistanceSummary points={dayGeoPoints} />
                </div>
              </div>
              {renderTimeline(day.id)}
            </div>
          );
        })}
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
