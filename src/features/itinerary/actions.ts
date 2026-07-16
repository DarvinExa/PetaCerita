"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/server/db";
import { requireTripMember, PermissionError } from "@/server/permissions";
import { broadcastTripChange } from "@/server/realtime";
import { insertAt, nextOrder } from "./ordering";
import {
  createPlaceSchema,
  updateItemSchema,
  moveItemSchema,
  idPairSchema,
} from "./validation";

export type ItineraryActionState = { error: string } | null;

/**
 * Revalidate cache halaman itinerary lalu broadcast nudge ke anggota lain agar
 * mereka refresh. Broadcast best-effort (tidak melempar), jadi aman di-await.
 */
async function revalidateBoard(tripId: string) {
  revalidatePath(`/trips/${tripId}/itinerary`);
  await broadcastTripChange(tripId, "itinerary");
}

/** Pesan error ramah dari sebuah exception aksi. */
function toErrorState(err: unknown): ItineraryActionState {
  if (err instanceof PermissionError) return { error: err.message };
  return { error: "Terjadi kesalahan. Coba lagi." };
}

/**
 * Buat tempat baru dan langsung tambahkan ke Bucket (item dengan dayId null).
 * Setiap anggota trip boleh menambah kandidat tempat.
 */
export async function createPlace(
  _prev: ItineraryActionState,
  formData: FormData,
): Promise<ItineraryActionState> {
  const parsed = createPlaceSchema.safeParse({
    tripId: formData.get("tripId"),
    name: formData.get("name"),
    category: formData.get("category"),
    address: formData.get("address") ?? "",
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }
  const { tripId, name, category, address, note } = parsed.data;

  try {
    const member = await requireTripMember(tripId);

    // order berikutnya di Bucket (dayId null) untuk trip ini.
    const bucket = await prisma.itineraryItem.findMany({
      where: { tripId, dayId: null },
      select: { id: true, order: true },
    });

    await prisma.place.create({
      data: {
        tripId,
        name,
        category,
        address: address || null,
        note: note || null,
        createdById: member.userId,
        items: {
          create: {
            tripId,
            category,
            order: nextOrder(bucket),
          },
        },
      },
    });

    await revalidateBoard(tripId);
    return null;
  } catch (err) {
    return toErrorState(err);
  }
}

/** Ubah detail item: kategori, waktu, catatan, dan perkiraan biaya. */
export async function updateItem(
  _prev: ItineraryActionState,
  formData: FormData,
): Promise<ItineraryActionState> {
  const parsed = updateItemSchema.safeParse({
    tripId: formData.get("tripId"),
    itemId: formData.get("itemId"),
    category: formData.get("category"),
    startTime: formData.get("startTime") ?? "",
    endTime: formData.get("endTime") ?? "",
    note: formData.get("note") ?? "",
    estimatedCost: formData.get("estimatedCost") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }
  const { tripId, itemId, category, startTime, endTime, note, estimatedCost } =
    parsed.data;

  // endTime tidak boleh sebelum startTime bila keduanya diisi.
  if (startTime && endTime && endTime < startTime) {
    return { error: "Waktu selesai tidak boleh sebelum waktu mulai" };
  }

  try {
    await requireTripMember(tripId);

    // Pastikan item milik trip ini sebelum mengubah.
    const item = await prisma.itineraryItem.findUnique({
      where: { id: itemId },
      select: { tripId: true, dayId: true },
    });
    if (!item || item.tripId !== tripId) {
      return { error: "Item tidak ditemukan" };
    }

    await prisma.itineraryItem.update({
      where: { id: itemId },
      data: {
        category,
        startTime: startTime || null,
        endTime: endTime || null,
        note: note || null,
        estimatedCost,
      },
    });

    await revalidateBoard(tripId);
    return null;
  } catch (err) {
    return toErrorState(err);
  }
}

/**
 * Pindahkan item ke kontainer tujuan (Bucket bila toDayId null, atau hari
 * tertentu) pada posisi toIndex, lalu normalisasi order kontainer tujuan.
 * Inilah yang mempersistensi hasil drag-drop. Dipanggil langsung (bukan lewat
 * useActionState) sehingga menerima argumen JSON, bukan FormData.
 */
export async function moveItem(input: {
  tripId: string;
  itemId: string;
  toDayId: string | null;
  toIndex: number;
}): Promise<ItineraryActionState> {
  const parsed = moveItemSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }
  const { tripId, itemId, toDayId, toIndex } = parsed.data;

  try {
    await requireTripMember(tripId);

    const item = await prisma.itineraryItem.findUnique({
      where: { id: itemId },
      select: { tripId: true },
    });
    if (!item || item.tripId !== tripId) {
      return { error: "Item tidak ditemukan" };
    }

    // Validasi hari tujuan milik trip yang sama.
    if (toDayId !== null) {
      const day = await prisma.day.findUnique({
        where: { id: toDayId },
        select: { tripId: true },
      });
      if (!day || day.tripId !== tripId) {
        return { error: "Hari tujuan tidak valid" };
      }
    }

    // Ambil calon tetangga di kontainer tujuan (tanpa item yang dipindah),
    // hitung ulang order, lalu persist dalam satu transaksi.
    const siblings = await prisma.itineraryItem.findMany({
      where: { tripId, dayId: toDayId, id: { not: itemId } },
      select: { id: true, order: true },
    });
    const destinationOrders = insertAt(siblings, itemId, toIndex);

    const sourceSiblings =
      item.dayId === toDayId
        ? []
        : await prisma.itineraryItem.findMany({
            where: { tripId, dayId: item.dayId, id: { not: itemId } },
            select: { id: true, order: true },
            orderBy: { order: "asc" },
          });
    const sourceOrders = sourceSiblings.map((source, order) => ({
      id: source.id,
      order,
    }));

    await prisma.$transaction(
      [...destinationOrders, ...sourceOrders].map((o) =>
        prisma.itineraryItem.update({
          where: { id: o.id },
          data:
            o.id === itemId
              ? { dayId: toDayId, order: o.order }
              : { order: o.order },
        }),
      ),
    );

    await revalidateBoard(tripId);
    return null;
  } catch (err) {
    return toErrorState(err);
  }
}

/**
 * Hapus satu item itinerary. Bila item ini satu-satunya yang memakai place-nya,
 * place ikut terhapus agar tidak menyisakan tempat yatim di Bucket.
 */
export async function deleteItem(
  _prev: ItineraryActionState,
  formData: FormData,
): Promise<ItineraryActionState> {
  const parsed = idPairSchema.safeParse({
    tripId: formData.get("tripId"),
    itemId: formData.get("itemId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }
  const { tripId, itemId } = parsed.data;

  try {
    await requireTripMember(tripId);

    const item = await prisma.itineraryItem.findUnique({
      where: { id: itemId },
      select: { tripId: true, placeId: true },
    });
    if (!item || item.tripId !== tripId) {
      return { error: "Item tidak ditemukan" };
    }

    const usingPlace = await prisma.itineraryItem.count({
      where: { placeId: item.placeId },
    });

    await prisma.$transaction(async (tx) => {
      await tx.itineraryItem.delete({ where: { id: itemId } });
      // Item terakhir yang memakai place ini: bersihkan place juga.
      if (usingPlace <= 1) {
        await tx.place.delete({ where: { id: item.placeId } });
      }
    });

    await revalidateBoard(tripId);
    return null;
  } catch (err) {
    return toErrorState(err);
  }
}
