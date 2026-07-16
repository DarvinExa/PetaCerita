"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/server/db";
import { requireTripMember, PermissionError } from "@/server/permissions";
import { nextOrder } from "@/features/itinerary/ordering";
import { attachPlaceSchema } from "@/features/itinerary/validation";
import { parseGmapsLink, isGmapsLink } from "./parse-gmaps-link";
import { reverseGeocode, geocodeQuery } from "./nominatim";

export type ResolveResult =
  | {
      status: "ok";
      place: {
        name: string;
        address: string | null;
        lat: number | null;
        lng: number | null;
      };
    }
  | { status: "error"; message: string };

/** Ekspansi link pendek (maps.app.goo.gl) ke URL penuh dengan mengikuti redirect. */
async function expandShortLink(url: string): Promise<string> {
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow" });
    return res.url || url;
  } catch {
    return url;
  }
}

/**
 * Resolusi link Google Maps yang di-paste menjadi data tempat: nama, koordinat,
 * dan alamat. Semua sumber gratis: parsing URL + reverse-geocode Nominatim.
 * Tidak mengambil foto/rating dari Google (langgar ToS). Dipanggil dari dialog
 * client untuk pratinjau sebelum disimpan.
 */
export async function resolveGmapsLink(link: string): Promise<ResolveResult> {
  const raw = (link ?? "").trim().slice(0, 2048);
  if (!raw) return { status: "error", message: "Tempel link Google Maps dulu." };
  if (!isGmapsLink(raw)) {
    return {
      status: "error",
      message: "Itu bukan link Google Maps. Salin dari tombol Bagikan di Maps.",
    };
  }

  // Link pendek tak memuat koordinat; ekspansi dulu agar bisa diparse.
  let parsed = parseGmapsLink(raw);
  if (parsed && parsed.lat === null && !parsed.query) {
    const expanded = await expandShortLink(raw);
    parsed = parseGmapsLink(expanded);
  }
  if (!parsed) {
    return { status: "error", message: "Link tidak bisa dibaca. Coba link lain." };
  }

  let { lat, lng } = parsed;
  const { query } = parsed;
  let address: string | null = null;

  // Ada koordinat: reverse-geocode untuk alamat (best-effort).
  if (lat !== null && lng !== null) {
    address = await reverseGeocode(lat, lng);
  } else if (query) {
    // Hanya nama: cari koordinat + alamat via geocode maju.
    const geo = await geocodeQuery(query);
    if (geo) {
      lat = geo.lat;
      lng = geo.lng;
      address = geo.address;
    }
  }

  // display_name Nominatim bisa panjang; pangkas agar muat batas skema.
  if (address && address.length > 300) address = address.slice(0, 297) + "...";

  const name = query ?? address?.split(",")[0]?.trim() ?? "Tempat dari Maps";

  if (lat === null && lng === null && !query) {
    return {
      status: "error",
      message: "Link tidak memuat lokasi. Pakai link tempat, bukan link rute.",
    };
  }

  return { status: "ok", place: { name, address, lat, lng } };
}

export type AttachState = { error: string } | { ok: true } | null;

/**
 * Simpan tempat hasil resolusi link ke Bucket. googlePlaceId dibiarkan kosong
 * (kita tak menyimpan id Google); rating/foto tidak disimpan. Tombol "Buka di
 * Google Maps" pada kartu dibangun dari koordinat/nama saat menampilkan.
 */
export async function attachPlaceFromLink(input: {
  tripId: string;
  category: string;
  name: string;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  note?: string;
}): Promise<AttachState> {
  const parsed = attachPlaceSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }
  const { tripId, category, name, address, lat, lng, note } = parsed.data;

  try {
    const member = await requireTripMember(tripId);

    const bucket = await prisma.itineraryItem.findMany({
      where: { tripId, dayId: null },
      select: { id: true, order: true },
    });

    await prisma.place.create({
      data: {
        tripId,
        name,
        category,
        address: address ?? null,
        note: note || null,
        lat: lat ?? null,
        lng: lng ?? null,
        createdById: member.userId,
        items: {
          create: { tripId, category, order: nextOrder(bucket) },
        },
      },
    });

    revalidatePath(`/trips/${tripId}/itinerary`);
    return { ok: true };
  } catch (err) {
    if (err instanceof PermissionError) return { error: err.message };
    return { error: "Gagal menyimpan tempat. Coba lagi." };
  }
}
