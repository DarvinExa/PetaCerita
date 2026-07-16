"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/server/db";
import { requireTripMember, PermissionError } from "@/server/permissions";
import { broadcastTripChange } from "@/server/realtime";
import { evenShares } from "./money";
import {
  createExpenseSchema,
  deleteExpenseSchema,
  setBudgetSchema,
  markPaidSchema,
  type CreateExpenseInput,
} from "./validation";

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

/**
 * Tandai satu transfer hasil netting sebagai lunas atau batal lunas. Hanya
 * penerima (payer/kreditur, yaitu toMember) yang boleh menandai, sesuai PRD
 * ("payer bisa ceklis lunas"). Nominal disimpan agar status batal otomatis bila
 * bill berubah dan nominal transfer bergeser.
 */
export async function markPaid(input: unknown): Promise<ExpenseActionState> {
  const parsed = markPaidSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }
  const { tripId, fromMemberId, toMemberId, amount, paid } = parsed.data;

  try {
    const member = await requireTripMember(tripId);

    // Hanya penerima (kreditur) yang boleh menandai lunas.
    const toMember = await prisma.tripMember.findUnique({
      where: { id: toMemberId },
      select: { tripId: true, userId: true },
    });
    if (!toMember || toMember.tripId !== tripId) {
      return { error: "Anggota tidak ditemukan" };
    }
    if (toMember.userId !== member.userId) {
      return { error: "Hanya penerima yang bisa menandai lunas" };
    }

    if (paid) {
      await prisma.settlement.upsert({
        where: {
          tripId_fromMemberId_toMemberId: { tripId, fromMemberId, toMemberId },
        },
        create: {
          tripId,
          fromMemberId,
          toMemberId,
          amount,
          status: "CONFIRMED",
          settledAt: new Date(),
        },
        update: { amount, status: "CONFIRMED", settledAt: new Date() },
      });
    } else {
      await prisma.settlement.deleteMany({
        where: { tripId, fromMemberId, toMemberId },
      });
    }

    await revalidateBill(tripId);
    return null;
  } catch (err) {
    return toErrorState(err);
  }
}
