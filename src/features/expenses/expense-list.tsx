"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Trash, Receipt } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { formatMoney } from "@/lib/money";
import { deleteExpense, type ExpenseActionState } from "./actions";
import { budgetCategoryMeta } from "./budget-categories";

/** Bentuk bill yang aman untuk Client Component (diturunkan dari getExpenses). */
export type BillRow = {
  id: string;
  title: string;
  date: string;
  currency: string;
  payerName: string;
  totalInCurrency: number;
  budgetCategory: string | null;
  items: {
    id: string;
    name: string;
    amount: number;
    isShared: boolean;
    participantCount: number;
  }[];
};

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      aria-label="Hapus bill"
      disabled={pending}
      className="flex size-11 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-danger/5 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger disabled:opacity-50"
    >
      <Trash className="size-4" aria-hidden />
    </button>
  );
}

function BillCard({ bill, tripId }: { bill: BillRow; tripId: string }) {
  const { notify } = useToast();
  const [state, action] = useActionState<ExpenseActionState, FormData>(
    deleteExpense,
    null,
  );

  useEffect(() => {
    if (state?.error) notify({ tone: "danger", title: state.error });
  }, [state, notify]);

  const dateFmt = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <Card className="bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[15px] font-semibold text-neutral-900">
              {bill.title}
            </h3>
            {budgetCategoryMeta(bill.budgetCategory) ? (
              <Badge variant="neutral">
                {budgetCategoryMeta(bill.budgetCategory)?.label}
              </Badge>
            ) : null}
          </div>
          <p className="mt-0.5 text-[13px] text-neutral-600">
            Dibayar {bill.payerName} - {dateFmt.format(new Date(bill.date))}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap text-[15px] font-semibold text-neutral-900 tabular-nums">
            {formatMoney(bill.totalInCurrency, bill.currency)}
          </span>
          <form action={action}>
            <input type="hidden" name="tripId" value={tripId} />
            <input type="hidden" name="expenseId" value={bill.id} />
            <DeleteButton />
          </form>
        </div>
      </div>

      <ul className="mt-3 flex flex-col gap-1 border-t border-neutral-100 pt-3">
        {bill.items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-2 text-[13px]"
          >
            <span className="min-w-0 truncate text-neutral-700">
              {item.name}
              {item.isShared ? (
                <span className="ml-1.5 text-neutral-400">(bersama)</span>
              ) : (
                <span className="ml-1.5 text-neutral-400">
                  {item.participantCount} orang
                </span>
              )}
            </span>
            <span className="whitespace-nowrap text-neutral-600 tabular-nums">
              {formatMoney(item.amount, bill.currency)}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/** Daftar semua bill sebuah trip. */
export function ExpenseList({
  tripId,
  bills,
}: {
  tripId: string;
  bills: BillRow[];
}) {
  if (bills.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-2 bg-white p-8 text-center">
        <Receipt className="size-8 text-neutral-300" aria-hidden />
        <p className="text-[15px] font-medium text-neutral-700">
          Belum ada bill
        </p>
        <p className="text-[13px] text-neutral-500">
          Buat bill pertama untuk mulai membagi pengeluaran trip.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {bills.map((bill) => (
        <BillCard key={bill.id} bill={bill} tripId={tripId} />
      ))}
    </div>
  );
}
