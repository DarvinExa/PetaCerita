import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Receipt } from "@phosphor-icons/react/dist/ssr";
import { requireTripMember, PermissionError } from "@/server/permissions";
import { getTripDetail } from "@/features/trips/trip-detail-queries";
import {
  getExpenses,
  getTripMembers,
  getSettleUp,
  getBudgetSummary,
} from "@/features/expenses/queries";
import { CreateBillForm } from "@/features/expenses/create-bill-form";
import { ExpenseList, type BillRow } from "@/features/expenses/expense-list";
import { SettleUpPanel } from "@/features/expenses/settle-up-panel";
import { BudgetPlanner } from "@/features/expenses/budget-planner";
import { TripRealtime } from "@/features/realtime/trip-realtime";
import { BUDGET_CATEGORIES } from "@/features/expenses/validation";

export default async function BillPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;

  // Cek izin di lapisan aplikasi (Prisma bypass RLS).
  let membership;
  try {
    membership = await requireTripMember(tripId);
  } catch (err) {
    if (err instanceof PermissionError) notFound();
    throw err;
  }

  const [trip, expenses, members, settleUp, budget] = await Promise.all([
    getTripDetail(tripId),
    getExpenses(tripId),
    getTripMembers(tripId),
    getSettleUp(tripId),
    getBudgetSummary(tripId),
  ]);
  if (!trip) notFound();

  const currency = trip.baseCurrency;

  // Bentuk bill agar aman untuk Client Component.
  const bills: BillRow[] = expenses.map((e) => ({
    id: e.id,
    title: e.title,
    date: e.date.toISOString().slice(0, 10),
    currency: e.currency,
    payerName: e.payer.user.name,
    totalInCurrency: e.items.reduce((a, i) => a + i.amount, 0),
    budgetCategory: e.budgetCategory,
    items: e.items.map((i) => ({
      id: i.id,
      name: i.name,
      amount: i.amount,
      isShared: i.isShared,
      participantCount: i.shares.length,
    })),
  }));

  // Map budget (Map) menjadi baris array yang bisa di-serialize ke client.
  const budgetRows = BUDGET_CATEGORIES.map((category) => ({
    category,
    planned: budget.planByCategory.get(category) ?? 0,
    actual: budget.actualByCategory.get(category) ?? 0,
  }));

  const memberOptions = members.map((m) => ({ id: m.id, name: m.name }));

  return (
    <div className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-8">
      <TripRealtime tripId={tripId} scope="bill" />
      <Link
        href={`/trips/${tripId}`}
        className="mb-4 inline-flex min-h-11 items-center gap-1.5 rounded-2xl text-[13px] text-neutral-600 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
      >
        <ArrowLeft className="size-4" aria-hidden />
        <span>Kembali ke trip</span>
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Budget dan Split Bill
          </h1>
          <p className="mt-1 text-[13px] text-neutral-600">
            {trip.name} - catat pengeluaran, bagi per item, lalu selesaikan
            patungan.
          </p>
        </div>
        <CreateBillForm
          tripId={tripId}
          members={memberOptions}
          baseCurrency={currency}
          defaultPayerId={membership.id}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-3">
            <h2 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-neutral-500">
              <Receipt className="size-4" aria-hidden />
              Daftar bill ({bills.length})
            </h2>
            <ExpenseList tripId={tripId} bills={bills} />
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-neutral-500">
              Budget planner
            </h2>
            <BudgetPlanner
              tripId={tripId}
              rows={budgetRows}
              totalPlanned={budget.totalPlanned}
              totalActual={budget.totalActual}
              baseCurrency={currency}
            />
          </section>
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-neutral-500">
            Settle up
          </h2>
          <SettleUpPanel
            tripId={tripId}
            balances={settleUp.balances}
            transfers={settleUp.transfers}
            currentMemberId={membership.id}
            baseCurrency={currency}
          />
        </section>
      </div>
    </div>
  );
}
