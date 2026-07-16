import "server-only";
import { prisma } from "@/server/db";
import {
  netBalances,
  minimizeTransfers,
  convertToBase,
  type ExpenseInput,
} from "./money";

/**
 * Query Split Bill dan Budget. Pemanggil wajib sudah memverifikasi keanggotaan
 * trip (requireTripMember), karena Prisma melewati RLS.
 */

/** Anggota trip untuk pemilihan payer/peserta, dengan nama tampil. */
export async function getTripMembers(tripId: string) {
  const members = await prisma.tripMember.findMany({
    where: { tripId },
    select: {
      id: true,
      userId: true,
      role: true,
      user: { select: { name: true } },
    },
    orderBy: { joinedAt: "asc" },
  });
  return members.map((m) => ({
    id: m.id,
    userId: m.userId,
    role: m.role,
    name: m.user.name,
  }));
}

/** Semua bill sebuah trip lengkap dengan item dan share, terbaru dulu. */
export async function getExpenses(tripId: string) {
  return prisma.expense.findMany({
    where: { tripId },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    include: {
      payer: { select: { id: true, user: { select: { name: true } } } },
      items: {
        orderBy: { order: "asc" },
        include: {
          shares: {
            include: { member: { select: { id: true } } },
          },
        },
      },
    },
  });
}

export type ExpenseWithDetail = Awaited<ReturnType<typeof getExpenses>>[number];

/**
 * Bentuk expense DB menjadi input logika uang murni. Kurs Decimal dikonversi ke
 * number di sini (satu-satunya titik konversi), nilai uang tetap integer.
 */
function toExpenseInput(expense: ExpenseWithDetail): ExpenseInput {
  return {
    payerId: expense.payerId,
    rate: Number(expense.exchangeRateToBase),
    items: expense.items.map((item) => ({
      amount: item.amount,
      isShared: item.isShared,
      shares: item.shares.map((s) => ({
        memberId: s.memberId,
        shareAmount: s.shareAmount,
      })),
    })),
  };
}

/**
 * Data halaman Settle Up: net tiap anggota (base currency) dan daftar transfer
 * minimal hasil netting, digabung dengan status "mark as paid" yang tersimpan.
 * Transfer dihitung ulang dari bill setiap kali; baris Settlement hanya sumber
 * status, dicocokkan per pasangan (from, to).
 */
export async function getSettleUp(tripId: string) {
  const [expenses, members, persisted] = await Promise.all([
    getExpenses(tripId),
    getTripMembers(tripId),
    prisma.settlement.findMany({ where: { tripId } }),
  ]);

  const net = netBalances(expenses.map(toExpenseInput));
  const transfers = minimizeTransfers(net);

  const statusByPair = new Map<string, (typeof persisted)[number]>();
  for (const s of persisted) {
    statusByPair.set(`${s.fromMemberId}:${s.toMemberId}`, s);
  }

  const nameById = new Map(members.map((m) => [m.id, m.name]));

  const suggested = transfers.map((t) => {
    const persistedRow = statusByPair.get(`${t.fromMemberId}:${t.toMemberId}`);
    // Status "paid" hanya relevan bila nominal tersimpan cocok dengan nominal
    // transfer saat ini; kalau bill berubah, anggap belum dibayar lagi.
    const paid =
      persistedRow?.status === "CONFIRMED" && persistedRow.amount === t.amount;
    return {
      fromMemberId: t.fromMemberId,
      toMemberId: t.toMemberId,
      fromName: nameById.get(t.fromMemberId) ?? "?",
      toName: nameById.get(t.toMemberId) ?? "?",
      amount: t.amount,
      paid,
    };
  });

  const balances = members.map((m) => ({
    memberId: m.id,
    name: m.name,
    net: net.get(m.id) ?? 0,
  }));

  return { balances, transfers: suggested };
}

export type SettleUp = Awaited<ReturnType<typeof getSettleUp>>;

/**
 * Ringkasan budget: estimasi per kategori vs realisasi. Realisasi dihitung dari
 * expense (total item dikonversi ke base currency) yang punya budgetCategory.
 */
export async function getBudgetSummary(tripId: string) {
  const [plans, expenses] = await Promise.all([
    prisma.budgetPlan.findMany({ where: { tripId } }),
    getExpenses(tripId),
  ]);

  // Realisasi per kategori dalam base currency.
  const actualByCategory = new Map<string, number>();
  let totalActual = 0;
  for (const expense of expenses) {
    const rate = Number(expense.exchangeRateToBase);
    const totalCurrency = expense.items.reduce((a, i) => a + i.amount, 0);
    // Konversi lewat convertToBase (BigInt, bebas galat float) agar konsisten
    // dengan jalur netting; hindari Math.round(total * rate) yang bisa geser.
    const base = convertToBase(totalCurrency, rate);
    totalActual += base;
    if (expense.budgetCategory) {
      actualByCategory.set(
        expense.budgetCategory,
        (actualByCategory.get(expense.budgetCategory) ?? 0) + base,
      );
    }
  }

  const planByCategory = new Map(plans.map((p) => [p.category, p.amount]));
  const totalPlanned = plans.reduce((a, p) => a + p.amount, 0);

  return {
    planByCategory,
    actualByCategory,
    totalPlanned,
    totalActual,
  };
}

export type BudgetSummary = Awaited<ReturnType<typeof getBudgetSummary>>;
