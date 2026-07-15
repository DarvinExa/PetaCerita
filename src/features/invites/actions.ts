"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db";
import { requireUser } from "@/server/auth";
import { requireTripOwner, PermissionError } from "@/server/permissions";
import {
  generateInviteToken,
  hashInviteToken,
  safeHashEquals,
} from "@/server/invite-token";
import { rateLimit } from "@/server/rate-limit";

export type InviteActionState = { error: string } | null;

// Pilihan durasi kedaluwarsa link (dalam hari). null = tanpa kedaluwarsa.
const EXPIRY_DAYS = new Set([1, 7, 30]);

const generateSchema = z.object({
  tripId: z.string().uuid(),
  expiresInDays: z
    .union([z.coerce.number().int(), z.null()])
    .optional()
    .transform((v) => (v == null || Number.isNaN(v) ? null : v))
    .refine((v) => v === null || EXPIRY_DAYS.has(v), "Durasi tidak valid"),
});

const tripIdSchema = z.object({ tripId: z.string().uuid() });

const removeMemberSchema = z.object({
  tripId: z.string().uuid(),
  memberId: z.string().uuid(),
});

function expiryDate(days: number | null): Date | null {
  if (days === null) return null;
  return new Date(Date.now() + days * 86_400_000);
}

/**
 * Buat atau ganti (regenerate) invite link trip. Hanya Owner. Regenerate
 * mengganti baris lama sehingga token lama langsung tidak berlaku.
 */
export async function generateInvite(
  _prev: InviteActionState,
  formData: FormData,
): Promise<InviteActionState> {
  const parsed = generateSchema.safeParse({
    tripId: formData.get("tripId"),
    expiresInDays: formData.get("expiresInDays"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }

  const { tripId, expiresInDays } = parsed.data;
  let ownerMembership;
  try {
    ownerMembership = await requireTripOwner(tripId);
  } catch (err) {
    if (err instanceof PermissionError) return { error: err.message };
    throw err;
  }

  const { token, tokenHash } = generateInviteToken();
  const expiresAt = expiryDate(expiresInDays);
  const createdById = ownerMembership.userId;

  // Upsert per trip: satu invite aktif per trip; regenerate menimpa token.
  await prisma.tripInvite.upsert({
    where: { tripId },
    create: { tripId, token, tokenHash, expiresAt, createdById },
    update: { token, tokenHash, expiresAt, createdById },
  });

  revalidatePath(`/trips/${tripId}`);
  return null;
}

/** Cabut invite link trip. Hanya Owner. Link langsung tidak berlaku. */
export async function revokeInvite(
  _prev: InviteActionState,
  formData: FormData,
): Promise<InviteActionState> {
  const parsed = tripIdSchema.safeParse({ tripId: formData.get("tripId") });
  if (!parsed.success) return { error: "Input tidak valid" };

  const { tripId } = parsed.data;
  try {
    await requireTripOwner(tripId);
  } catch (err) {
    if (err instanceof PermissionError) return { error: err.message };
    throw err;
  }

  // deleteMany: aman meski invite sudah tidak ada.
  await prisma.tripInvite.deleteMany({ where: { tripId } });
  revalidatePath(`/trips/${tripId}`);
  return null;
}

/** Keluarkan anggota dari trip. Hanya Owner. Owner tidak bisa dikeluarkan. */
export async function removeMember(
  _prev: InviteActionState,
  formData: FormData,
): Promise<InviteActionState> {
  const parsed = removeMemberSchema.safeParse({
    tripId: formData.get("tripId"),
    memberId: formData.get("memberId"),
  });
  if (!parsed.success) return { error: "Input tidak valid" };

  const { tripId, memberId } = parsed.data;
  try {
    await requireTripOwner(tripId);
  } catch (err) {
    if (err instanceof PermissionError) return { error: err.message };
    throw err;
  }

  const member = await prisma.tripMember.findUnique({ where: { id: memberId } });
  if (!member || member.tripId !== tripId) {
    return { error: "Anggota tidak ditemukan" };
  }
  if (member.role === "OWNER") {
    return { error: "Owner tidak bisa dikeluarkan dari trip" };
  }

  await prisma.tripMember.delete({ where: { id: memberId } });
  revalidatePath(`/trips/${tripId}`);
  return null;
}

/** Alasan kegagalan validasi token invite, untuk pesan yang tepat. */
export type InviteValidity =
  | { status: "valid"; tripId: string }
  | { status: "invalid" }
  | { status: "expired" };

/**
 * Verifikasi token invite tanpa efek samping. Lookup lewat hash (token mentah
 * tidak pernah dibandingkan langsung di query). Perbandingan hash waktu
 * konstan untuk mencegah timing attack.
 */
export async function resolveInviteToken(
  token: string,
): Promise<InviteValidity> {
  if (!token || token.length < 16 || token.length > 128) {
    return { status: "invalid" };
  }

  const tokenHash = hashInviteToken(token);
  const invite = await prisma.tripInvite.findUnique({
    where: { tokenHash },
    select: { tripId: true, tokenHash: true, expiresAt: true },
  });

  if (!invite || !safeHashEquals(invite.tokenHash, tokenHash)) {
    return { status: "invalid" };
  }
  if (invite.expiresAt && invite.expiresAt.getTime() <= Date.now()) {
    return { status: "expired" };
  }
  return { status: "valid", tripId: invite.tripId };
}

/**
 * Nama trip untuk halaman join publik. Hanya mengembalikan nama, tidak ada
 * data trip lain, agar link tidak membocorkan detail sebelum user login.
 * Rate limit dulu untuk mencegah brute force token.
 */
export async function peekInviteTripName(
  token: string,
): Promise<{ status: "valid"; tripName: string } | { status: "invalid" | "expired" }> {
  const gate = await limitTokenAttempt();
  if (!gate.ok) return { status: "invalid" };

  const result = await resolveInviteToken(token);
  if (result.status !== "valid") return result;

  const trip = await prisma.trip.findUnique({
    where: { id: result.tripId },
    select: { name: true },
  });
  if (!trip) return { status: "invalid" };
  return { status: "valid", tripName: trip.name };
}

/** Batasi percobaan penggunaan token per IP untuk mencegah brute force. */
async function limitTokenAttempt() {
  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "unknown";
  // 20 percobaan per menit per IP.
  return rateLimit(`invite:${ip}`, 20, 60_000);
}

/**
 * User terautentikasi bergabung ke trip lewat token. Idempotent: bila sudah
 * anggota, langsung arahkan ke trip. Owner join sebagai MEMBER via link tidak
 * mengubah role Owner yang sudah ada.
 */
export async function joinViaInviteForm(formData: FormData): Promise<never> {
  const token = formData.get("token");
  if (typeof token !== "string") redirect("/dashboard");
  return joinViaInvite(token);
}

export async function joinViaInvite(token: string): Promise<never> {
  const user = await requireUser();

  const gate = await limitTokenAttempt();
  if (!gate.ok) {
    redirect(`/join/${token}?status=ratelimited`);
  }

  const result = await resolveInviteToken(token);
  if (result.status === "expired") {
    redirect(`/join/${token}?status=expired`);
  }
  if (result.status !== "valid") {
    redirect(`/join/${token}?status=invalid`);
  }

  const { tripId } = result;
  try {
    await prisma.tripMember.create({
      data: { tripId, userId: user.id, role: "MEMBER", joinedVia: "INVITE_LINK" },
    });
    revalidatePath("/dashboard");
  } catch (err) {
    // P2002: sudah jadi anggota. Perlakukan sebagai sukses (idempotent).
    if (
      !(err instanceof Prisma.PrismaClientKnownRequestError) ||
      err.code !== "P2002"
    ) {
      throw err;
    }
  }

  redirect(`/trips/${tripId}`);
}
