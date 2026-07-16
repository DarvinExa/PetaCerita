"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/server/db";
import { requireTripMember, PermissionError } from "@/server/permissions";
import { broadcastTripChange } from "@/server/realtime";
import { rateLimit } from "@/server/rate-limit";
import { evenShares } from "./money";
import { getSettleUp } from "./queries";
import {
  createExpenseSchema,
  deleteExpenseSchema,
  setBudgetSchema,
  settlementActionSchema,
  type CreateExpenseInput,
} from "./validation";
import { settlementTransition, type SettlementActor } from "./settlement-state";

export type ExpenseActionState = { error: string } | null;

async function revalidateBill(tripId: string) {
  revalidatePath(`/trips/${tripId}/bill`);
  await broadcastTripChange(tripId, "bill");
}

function toErrorState(err: unknown): ExpenseActionState {
  if (err instanceof PermissionError) return { error: err.message };
  return { error: "Terjadi kesalahan. Coba lagi." };
}

/** Pastikan semua memberId benar-benar anggota trip ini. */
async function assertMembersInTrip(
  tripId: string,
  memberIds: string[],
): Promise<boolean> {
  const unique = [...new Set(memberIds)];
  if (unique.length === 0) return true;
  const count = await prisma.tripMember.count({
    where: { tripId, id: { in: unique } },
  });
  return count === unique.length;
}

/**
 * Buat bill baru dengan banyak item dan share per item. Semua anggota trip boleh
 * membuat bill. Nilai uang integer minor unit; share yang tidak di-override
 * dibagi rata di server (largest remainder) agar jumlah share == amount item.
 * Item bersama (isShared) tidak menyimpan share; dibagi saat perhitungan netting.
 */
export async function createExpense(
  input: CreateExpenseInput,
): Promise<ExpenseActionState> {
  const parsed = createExpenseSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }
  const data = parsed.data;

  try {
    const member = await requireTripMember(data.tripId);
    const gate = rateLimit(
      `bill:create:${data.tripId}:${member.userId}`,
      20,
      60_000,
    );
    if (!gate.ok)
      return { error: "Terlalu banyak bill dibuat. Coba lagi sebentar." };

    const trip = await prisma.trip.findUnique({
      where: { id: data.tripId },
      select: { startDate: true, endDate: true, baseCurrency: true },
    });
    if (!trip) return { error: "Trip tidak ditemukan" };
    const expenseDate = new Date(`${data.date}T00:00:00.000Z`);
    if (expenseDate < trip.startDate || expenseDate > trip.endDate) {
      return { error: "Tanggal bill harus berada dalam rentang trip" };
    }
    if (data.currency === trip.baseCurrency && data.exchangeRateToBase !== 1) {
      return { error: "Kurs mata uang dasar harus bernilai 1" };
    }

    // Payer dan semua peserta share wajib anggota trip ini.
    const participantIds = data.items.flatMap((i) =>
      i.isShared ? [] : i.shares.map((s) => s.memberId),
    );
    const ok = await assertMembersInTrip(data.tripId, [
      data.payerId,
      ...participantIds,
    ]);
    if (!ok) return { error: "Ada peserta yang bukan anggota trip" };

    await prisma.expense.create({
      data: {
        tripId: data.tripId,
        payerId: data.payerId,
        title: data.title,
        date: data.date,
        currency: data.currency,
        exchangeRateToBase: data.exchangeRateToBase,
        budgetCategory: data.budgetCategory,
        createdById: member.userId,
        items: {
          create: data.items.map((item, index) => {
            // Item bersama: tanpa share tersimpan.
            if (item.isShared) {
              return {
                name: item.name,
                amount: item.amount,
                isShared: true,
                order: index,
              };
            }
            // Share manual bila diberikan dan totalnya cocok; kalau tidak, rata.
            const memberIds = item.shares.map((s) => s.memberId);
            const sumShares = item.shares.reduce(
              (a, s) => a + (s.shareAmount ?? 0),
              0,
            );
            const useManual =
              item.shares.every((s) => typeof s.shareAmount === "number") &&
              sumShares === item.amount;
            const shares = useManual
              ? item.shares.map((s) => ({
                  memberId: s.memberId,
                  shareAmount: s.shareAmount as number,
                }))
              : evenShares(item.amount, memberIds);
            return {
              name: item.name,
              amount: item.amount,
              isShared: false,
              order: index,
              shares: { create: shares },
            };
          }),
        },
      },
    });

    await revalidateBill(data.tripId);
    return null;
  } catch (err) {
    return toErrorState(err);
  }
}

/** Hapus bill. Hanya pembuat bill atau Owner trip yang boleh. */
export async function deleteExpense(
  _prev: ExpenseActionState,
  formData: FormData,
): Promise<ExpenseActionState> {
  const parsed = deleteExpenseSchema.safeParse({
    tripId: formData.get("tripId"),
    expenseId: formData.get("expenseId"),
  });
  if (!parsed.success) return { error: "Input tidak valid" };
  const { tripId, expenseId } = parsed.data;

  try {
    const member = await requireTripMember(tripId);
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      select: { tripId: true, createdById: true },
    });
    if (!expense || expense.tripId !== tripId) {
      return { error: "Bill tidak ditemukan" };
    }
    if (expense.createdById !== member.userId && member.role !== "OWNER") {
      return { error: "Hanya pembuat bill atau Owner yang bisa menghapus" };
    }

    await prisma.expense.delete({ where: { id: expenseId } });
    await revalidateBill(tripId);
    return null;
  } catch (err) {
    return toErrorState(err);
  }
}

/**
 * Simpan (upsert) estimasi budget satu kategori. amount 0 menghapus estimasi.
 * Semua anggota trip boleh mengatur budget.
 */
export async function saveBudget(
  _prev: ExpenseActionState,
  formData: FormData,
): Promise<ExpenseActionState> {
  const parsed = setBudgetSchema.safeParse({
    tripId: formData.get("tripId"),
    category: formData.get("category"),
    amount: formData.get("amount") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }
  const { tripId, category, amount } = parsed.data;

  try {
    await requireTripMember(tripId);

    if (amount === null || amount === 0) {
      await prisma.budgetPlan.deleteMany({ where: { tripId, category } });
    } else {
      await prisma.budgetPlan.upsert({
        where: { tripId_category: { tripId, category } },
        create: { tripId, category, amount },
        update: { amount },
      });
    }

    await revalidateBill(tripId);
    return null;
  } catch (err) {
    return toErrorState(err);
  }
}

class SettlementConflictError extends Error {}

/**
 * Jalankan state machine settlement dua arah. Debitur mengirim bukti status
 * transfer, lalu kreditur mengonfirmasi atau menolak. Setiap perubahan dicatat
 * sebagai event audit dan nominal selalu diverifikasi dari netting terbaru.
 */
export async function updateSettlementStatus(
  input: unknown,
): Promise<ExpenseActionState> {
  const parsed = settlementActionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }
  const { tripId, fromMemberId, toMemberId, amount, action } = parsed.data;

  try {
    const member = await requireTripMember(tripId);
    const gate = rateLimit(`settlement:${tripId}:${member.userId}`, 60, 60_000);
    if (!gate.ok)
      return { error: "Terlalu banyak perubahan. Coba lagi sebentar." };

    const pair = await prisma.tripMember.findMany({
      where: { tripId, id: { in: [fromMemberId, toMemberId] } },
      select: { id: true },
    });
    if (pair.length !== 2 || fromMemberId === toMemberId) {
      return { error: "Pasangan transfer tidak valid" };
    }

    // Jangan percaya nominal dari client. Transfer harus masih ada dan sama
    // persis dengan hasil netting server saat aksi dilakukan.
    const settleUp = await getSettleUp(tripId);
    const currentTransfer = settleUp.transfers.find(
      (transfer) =>
        transfer.fromMemberId === fromMemberId &&
        transfer.toMemberId === toMemberId,
    );
    if (!currentTransfer || currentTransfer.amount !== amount) {
      return { error: "Nominal transfer sudah berubah. Muat ulang halaman." };
    }

    const persisted = await prisma.settlement.findUnique({
      where: {
        tripId_fromMemberId_toMemberId: { tripId, fromMemberId, toMemberId },
      },
      select: { id: true, amount: true, status: true },
    });
    const currentStatus =
      persisted?.amount === amount ? persisted.status : "UNPAID";
    const actor: SettlementActor =
      member.id === fromMemberId
        ? "DEBTOR"
        : member.id === toMemberId
          ? "CREDITOR"
          : "OTHER";
    const transition = settlementTransition(currentStatus, action, actor);
    if (!transition) {
      return { error: "Aksi tidak sesuai dengan status transfer saat ini" };
    }

    const now = new Date();
    await prisma.$transaction(async (tx) => {
      let settlementId: string;
      if (action === "SUBMIT") {
        const row = await tx.settlement.upsert({
          where: {
            tripId_fromMemberId_toMemberId: {
              tripId,
              fromMemberId,
              toMemberId,
            },
          },
          create: {
            tripId,
            fromMemberId,
            toMemberId,
            amount,
            status: "PENDING",
            submittedAt: now,
            settledAt: null,
          },
          update: {
            amount,
            status: "PENDING",
            submittedAt: now,
            settledAt: null,
          },
          select: { id: true },
        });
        settlementId = row.id;
      } else {
        if (!persisted || persisted.amount !== amount) {
          throw new SettlementConflictError();
        }
        const updated = await tx.settlement.updateMany({
          where: { id: persisted.id, amount, status: currentStatus },
          data: {
            status: transition.nextStatus,
            submittedAt: transition.nextStatus === "UNPAID" ? null : undefined,
            settledAt: transition.nextStatus === "CONFIRMED" ? now : null,
          },
        });
        if (updated.count !== 1) throw new SettlementConflictError();
        settlementId = persisted.id;
      }

      await tx.settlementEvent.create({
        data: {
          settlementId,
          actorMemberId: member.id,
          type: transition.event,
        },
      });
    });

    await revalidateBill(tripId);
    return null;
  } catch (err) {
    if (err instanceof SettlementConflictError) {
      return { error: "Status transfer sudah berubah. Muat ulang halaman." };
    }
    return toErrorState(err);
  }
}
