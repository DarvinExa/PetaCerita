import { z } from "zod";

/**
 * Skema validasi input itinerary. Dipisah dari actions.ts (yang "use server"
 * dan server-only) agar bisa diunit-test tanpa memuat Prisma atau server-only.
 */

// Kategori selaras dengan Prisma ItineraryCategory.
export const CATEGORIES = [
  "ALAM",
  "ENTERTAIN",
  "KULINER",
  "PENGINAPAN",
  "TRANSPORT",
] as const;

// "HH:MM" 24 jam.
export const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Format waktu harus HH:MM");

// Rupiah utuh: integer non-negatif, dibatasi agar wajar (< 1 miliar).
export const costInt = z
  .number()
  .int("Biaya harus bilangan bulat")
  .min(0, "Biaya tidak boleh negatif")
  .max(1_000_000_000, "Biaya terlalu besar");

export const createPlaceSchema = z.object({
  tripId: z.string().uuid(),
  name: z.string().trim().min(1, "Nama tempat wajib diisi").max(120),
  category: z.enum(CATEGORIES),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  note: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const updateItemSchema = z.object({
  tripId: z.string().uuid(),
  itemId: z.string().uuid(),
  category: z.enum(CATEGORIES),
  startTime: timeString.optional().or(z.literal("")),
  endTime: timeString.optional().or(z.literal("")),
  note: z.string().trim().max(1000).optional().or(z.literal("")),
  // Kosong (atau hanya spasi) berarti hapus estimasi biaya. Selain itu harus
  // integer rupiah non-negatif. Cek string kosong dulu agar tidak ter-coerce
  // menjadi 0 oleh z.coerce.number().
  estimatedCost: z
    .string()
    .transform((v) => v.trim())
    .refine((v) => v === "" || /^\d+$/.test(v), {
      message: "Biaya tidak valid",
    })
    .transform((v) => (v === "" ? null : Number(v)))
    .refine((v) => v === null || costInt.safeParse(v).success, {
      message: "Biaya tidak valid",
    }),
});

export const moveItemSchema = z.object({
  tripId: z.string().uuid(),
  itemId: z.string().uuid(),
  // null = Bucket. Kalau diisi, harus hari milik trip ini.
  toDayId: z.string().uuid().nullable(),
  toIndex: z.number().int().min(0),
});

export const idPairSchema = z.object({
  tripId: z.string().uuid(),
  itemId: z.string().uuid(),
});

// Lampirkan tempat hasil resolusi link Google Maps. Nama/alamat/koordinat
// divalidasi ulang di server sebelum disimpan sebagai Place.
export const attachPlaceSchema = z.object({
  tripId: z.string().uuid(),
  category: z.enum(CATEGORIES),
  name: z.string().trim().min(1, "Nama tempat wajib diisi").max(120),
  address: z.string().trim().max(300).nullish(),
  lat: z.number().min(-90).max(90).nullish(),
  lng: z.number().min(-180).max(180).nullish(),
  note: z.string().trim().max(1000).optional().or(z.literal("")),
});
