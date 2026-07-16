"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  CalendarBlank,
  CaretLeft,
  CaretRight,
  Lightbulb,
} from "@phosphor-icons/react";
import { useToast } from "@/components/ui/toast";
import { useTripRealtime } from "@/features/realtime/use-trip-realtime";
import { TripMap } from "@/features/maps/trip-map";
import type { MapPoint } from "@/features/maps/trip-map-inner";
import { DayDistanceSummary } from "@/features/maps/distance-insights";
import { nearestPoint, type GeoPoint } from "@/features/maps/distance";
import { moveItem } from "./actions";
import { BucketIdeaCard, type BucketDayChoice } from "./bucket-idea-card";
import { CompactDayAgenda } from "./compact-day-agenda";
import { SortableItem } from "./sortable-item";
import { AddPlaceForm } from "./add-place-form";
import { EditItemDialog } from "./edit-item-dialog";
import { BUCKET_ID, containerOf, type BoardDay, type BoardItem } from "./types";

type Containers = Record<string, string[]>;

function groupItems(items: BoardItem[], dayIds: string[]): Containers {
  const grouped: Containers = { [BUCKET_ID]: [] };
  for (const id of dayIds) grouped[id] = [];
  const sorted = [...items].sort((a, b) => a.order - b.order);
  for (const item of sorted) {
    const key = containerOf(item.dayId);
    (grouped[key] ??= []).push(item.id);
  }
  return grouped;
}

function signature(items: BoardItem[]): string {
  return items
    .map((item) => `${item.id}:${item.dayId ?? "_"}:${item.order}`)
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
  const [savingOrder, startOrderTransition] = useTransition();
  useTripRealtime(tripId, "itinerary");

  const dayIds = useMemo(() => days.map((day) => day.id), [days]);
  const itemsById = useMemo(() => {
    const map = new Map<string, BoardItem>();
    for (const item of items) map.set(item.id, item);
    return map;
  }, [items]);

  const [containers, setContainers] = useState<Containers>(() =>
    groupItems(items, dayIds),
  );
  const currentSignature = signature(items);
  const [lastSignature, setLastSignature] = useState(currentSignature);
  if (currentSignature !== lastSignature) {
    setLastSignature(currentSignature);
    setContainers(groupItems(items, dayIds));
  }

  const [activeDayId, setActiveDayId] = useState<string | null>(
    days[0]?.id ?? null,
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editing, setEditing] = useState<BoardItem | null>(null);
  const [schedulingId, setSchedulingId] = useState<string | null>(null);

  useEffect(() => {
    if (!days.some((day) => day.id === activeDayId)) {
      setActiveDayId(days[0]?.id ?? null);
    }
  }, [activeDayId, days]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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
        googleMapsUrl: item.place.googleMapsUrl,
        label: String(index + 1),
        targetId: `itinerary-item-${item.id}`,
      }));
  }

  function findContainer(itemId: string): string | undefined {
    return Object.keys(containers).find((key) =>
      (containers[key] ?? []).includes(itemId),
    );
  }

  async function scheduleIdea(itemId: string, dayId: string) {
    if (schedulingId || !dayIds.includes(dayId)) return;
    const from = findContainer(itemId);
    if (!from || from !== BUCKET_ID) return;

    const previous = containers;
    const destination = containers[dayId] ?? [];
    const next = {
      ...containers,
      [BUCKET_ID]: (containers[BUCKET_ID] ?? []).filter((id) => id !== itemId),
      [dayId]: [...destination, itemId],
    };
    setContainers(next);
    setSchedulingId(itemId);

    try {
      const result = await moveItem({
        tripId,
        itemId,
        toDayId: dayId,
        toIndex: destination.length,
      });
      if (result?.error) {
        setContainers(previous);
        notify({ tone: "danger", title: result.error });
        return;
      }
      setActiveDayId(dayId);
      notify({ tone: "success", title: "Tempat ditambahkan ke jadwal." });
    } catch {
      setContainers(previous);
      notify({ tone: "danger", title: "Gagal memindahkan tempat. Coba lagi." });
    } finally {
      setSchedulingId(null);
    }
  }

  function handleDragStart(event: DragStartEvent) {
    const itemId = String(event.active.id);
    if (activeDayId && (containers[activeDayId] ?? []).includes(itemId)) {
      setActiveId(itemId);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    if (!activeDayId || !event.over) return;

    const itemId = String(event.active.id);
    const overId = String(event.over.id);
    const current = containers[activeDayId] ?? [];
    const oldIndex = current.indexOf(itemId);
    const overIndex =
      overId === activeDayId ? current.length - 1 : current.indexOf(overId);
    if (oldIndex < 0 || overIndex < 0 || oldIndex === overIndex) return;

    const previous = containers;
    const reordered = arrayMove(current, oldIndex, overIndex);
    setContainers({ ...containers, [activeDayId]: reordered });

    startOrderTransition(async () => {
      try {
        const result = await moveItem({
          tripId,
          itemId,
          toDayId: activeDayId,
          toIndex: overIndex,
        });
        if (result?.error) {
          setContainers(previous);
          notify({ tone: "danger", title: result.error });
        }
      } catch {
        setContainers(previous);
        notify({ tone: "danger", title: "Urutan gagal disimpan. Coba lagi." });
      }
    });
  }

  const dayFmt = new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
  const fullDayFmt = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const dayPointGroups = days.map((day, index) => ({
    id: day.id,
    label: `Hari ${index + 1}, ${dayFmt.format(day.date)}`,
    points: geoPointsFor(day.id),
  }));

  function choicesFor(item: BoardItem): BucketDayChoice[] {
    const candidate =
      item.place.lat !== null && item.place.lng !== null
        ? {
            id: item.id,
            name: item.place.name,
            lat: item.place.lat,
            lng: item.place.lng,
          }
        : null;

    return dayPointGroups.map((day) => {
      const nearest = candidate ? nearestPoint(candidate, day.points) : null;
      return {
        id: day.id,
        label: day.label,
        distanceKm: nearest?.distanceKm ?? null,
        nearestPlace: nearest?.point.name ?? null,
      };
    });
  }

  const bucketItems = itemsFor(BUCKET_ID);
  const activeDayIndex = days.findIndex((day) => day.id === activeDayId);
  const activeDay = activeDayIndex >= 0 ? days[activeDayIndex] : null;
  const activeDayItems = activeDay ? itemsFor(activeDay.id) : [];
  const activeDayMapPoints = activeDay ? mapPointsFor(activeDay.id) : [];
  const activeDayGeoPoints = activeDay ? geoPointsFor(activeDay.id) : [];
  const activeItem = activeId ? itemsById.get(activeId) : null;

  const bucketPanel = (
    <section className="flex min-w-0 flex-col gap-3 lg:sticky lg:top-24 lg:self-start">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-neutral-600">
            <Lightbulb className="size-4 text-sand-500" aria-hidden />
            Bucket Ide
          </h2>
          <p className="mt-1 text-[12px] leading-5 text-neutral-500">
            Kumpulkan tempat, lihat saran jarak, lalu pilih harinya.
          </p>
        </div>
        <AddPlaceForm tripId={tripId} />
      </div>

      <div className="rounded-lg border border-neutral-200 bg-neutral-50/80 p-2 shadow-sm">
        <div className="mb-2 flex items-center justify-between px-1 py-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
            {bucketItems.length} ide tersimpan
          </span>
          <span className="text-[11px] text-neutral-400">Tanpa drag</span>
        </div>
        {bucketItems.length > 0 ? (
          <div className="flex max-h-[680px] flex-col gap-2 overflow-y-auto pr-1">
            {bucketItems.map((item) => (
              <BucketIdeaCard
                key={item.id}
                item={item}
                currency={currency}
                days={choicesFor(item)}
                pending={schedulingId === item.id}
                onSchedule={scheduleIdea}
                onEdit={setEditing}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-40 flex-col items-center justify-center rounded-md border border-dashed border-neutral-300 bg-white px-4 text-center">
            <Lightbulb className="size-7 text-neutral-300" aria-hidden />
            <p className="mt-2 text-[13px] font-medium text-neutral-700">
              Belum ada ide tempat
            </p>
            <p className="mt-1 text-[12px] leading-5 text-neutral-500">
              Tambahkan tempat dari link Google Maps atau isi manual.
            </p>
          </div>
        )}
      </div>
    </section>
  );

  const daysPanel = (
    <section className="min-w-0">
      <div className="mb-3">
        <h2 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-neutral-600">
          <CalendarBlank className="size-4 text-teal-700" aria-hidden />
          Jadwal harian
        </h2>
        <p className="mt-1 text-[12px] leading-5 text-neutral-500">
          Satu hari dalam satu fokus. Gunakan panah atau pilih tanggal langsung.
        </p>
      </div>

      {activeDay ? (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 shadow-sm">
          <div className="border-b border-neutral-200 bg-white p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setActiveDayId(days[activeDayIndex - 1]?.id ?? null)
                }
                disabled={activeDayIndex <= 0}
                aria-label="Hari sebelumnya"
                className="flex size-11 shrink-0 items-center justify-center rounded-md border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <CaretLeft className="size-4" aria-hidden />
              </button>

              <div className="min-w-0 flex-1 text-center" aria-live="polite">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-teal-700">
                  Hari {activeDayIndex + 1} dari {days.length}
                </p>
                <p className="mt-0.5 truncate text-[16px] font-semibold capitalize text-neutral-900 sm:text-[18px]">
                  {fullDayFmt.format(activeDay.date)}
                </p>
                <p className="mt-0.5 text-[11px] text-neutral-500">
                  {activeDayItems.length} tempat terjadwal
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setActiveDayId(days[activeDayIndex + 1]?.id ?? null)
                }
                disabled={activeDayIndex >= days.length - 1}
                aria-label="Hari berikutnya"
                className="flex size-11 shrink-0 items-center justify-center rounded-md border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <CaretRight className="size-4" aria-hidden />
              </button>
            </div>

            <div
              className="mt-3 flex gap-2 overflow-x-auto pb-1"
              role="tablist"
              aria-label="Pilih hari perjalanan"
            >
              {days.map((day, index) => {
                const selected = day.id === activeDay.id;
                return (
                  <button
                    key={day.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setActiveDayId(day.id)}
                    className={
                      selected
                        ? "min-h-11 shrink-0 rounded-md bg-teal-800 px-3 text-left text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
                        : "min-h-11 shrink-0 rounded-md border border-neutral-200 bg-white px-3 text-left text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                    }
                  >
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] opacity-75">
                      Hari {index + 1}
                    </span>
                    <span className="mt-0.5 block text-[12px] font-semibold capitalize">
                      {dayFmt.format(day.date)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 p-3 sm:p-4">
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_250px]">
              <TripMap
                points={activeDayMapPoints}
                showPath
                emptyLabel="Tempat berkoordinat pada hari ini akan muncul sebagai rute."
              />
              <div className="rounded-lg border border-neutral-200 bg-white p-3">
                <h3 className="mb-2 text-[12px] font-semibold text-neutral-800">
                  Ringkasan rute
                </h3>
                <DayDistanceSummary points={activeDayGeoPoints} />
              </div>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={() => setActiveId(null)}
            >
              <CompactDayAgenda
                containerId={activeDay.id}
                items={activeDayItems}
                currency={currency}
                onEdit={setEditing}
              />
              <DragOverlay>
                {activeItem ? (
                  <div className="w-[min(480px,calc(100vw-32px))]">
                    <SortableItem
                      item={activeItem}
                      currency={currency}
                      onEdit={() => {}}
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>

            <p className="sr-only" aria-live="polite">
              {savingOrder
                ? "Menyimpan urutan agenda"
                : "Urutan agenda tersimpan"}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center text-[13px] text-neutral-500">
          Belum ada hari perjalanan.
        </div>
      )}
    </section>
  );

  return (
    <>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(300px,370px)_minmax(0,1fr)]">
        {bucketPanel}
        {daysPanel}
      </div>

      <EditItemDialog
        item={editing}
        tripId={tripId}
        onClose={() => setEditing(null)}
      />
    </>
  );
}
