"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireUser } from "@/server/auth";
import { eachDayInclusive, parseDateOnly } from "@/lib/dates";

export type CreateTripState = { error: string } | null;

// Maksimal durasi trip untuk membatasi jumlah Day yang dibuat.
const MAX_TRIP_DAYS = 60;

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid");

const createTripSchema = z
  .object({
    name: z.string().trim().min(1, "Nama trip wajib diisi").max(100),
    city: z.string().trim().min(1, "Kota tujuan wajib diisi").max(100),
    startDate: dateOnly,
    endDate: dateOnly,
    baseCurrency: z
      .string()
      .trim()
      .regex(/^[A-Z]{3}$/, "Kode mata uang tidak valid")
      .default("IDR"),
  })
  .refine((v) => parseDateOnly(v.endDate) >= parseDateOnly(v.startDate), {
    message: "Tanggal selesai tidak boleh sebelum tanggal mulai",
    path: ["endDate"],
  })
  .refine(
    (v) =>
      eachDayInclusive(parseDateOnly(v.startDate), parseDateOnly(v.endDate))
        .length <= MAX_TRIP_DAYS,
    {
      message: `Durasi trip maksimal ${MAX_TRIP_DAYS} hari`,
      path: ["endDate"],
    },
  );

export async function createTrip(
  _prev: CreateTripState,
  formData: FormData,
): Promise<CreateTripState> {
  const user = await requireUser();

  const parsed = createTripSchema.safeParse({
    name: formData.get("name"),
    city: formData.get("city"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    baseCurrency: formData.get("baseCurrency") || "IDR",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }

  const { name, city, startDate, endDate, baseCurrency } = parsed.data;
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  const days = eachDayInclusive(start, end);

  // Satu transaksi: trip, keanggotaan owner, dan seluruh Day.
  const trip = await prisma.trip.create({
    data: {
      name,
      city,
      startDate: start,
      endDate: end,
      baseCurrency,
      ownerId: user.id,
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
          joinedVia: "OWNER",
        },
      },
      days: {
        create: days.map((date, index) => ({ date, order: index })),
      },
    },
  });

  revalidatePath("/dashboard");
  redirect(`/trips/${trip.id}`);
}
