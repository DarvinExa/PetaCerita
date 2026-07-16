"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Check } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { formatMoney } from "@/lib/money";
import { saveBudget, type ExpenseActionState } from "./actions";
import {
  BUDGET_CATEGORY_ORDER,
  BUDGET_CATEGORY_META,
} from "./budget-categories";

type Row = {
  category: string;
  planned: number;
  actual: number;
};

function SaveBudgetButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      aria-label="Simpan estimasi"
      className="inline-flex h-10 items-center justify-center rounded-2xl border border-white/70 bg-white px-3 text-neutral-600 transition-all duration-300 ease-in-out hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 disabled:opacity-50"
      disabled={pending}
    >
      <Check className="size-4" aria-hidden />
    </button>
  );
}

/**
 * Budget planner: estimasi per kategori (bisa diedit inline) vs realisasi yang
 * dihitung otomatis dari bill. Bar menunjukkan realisasi relatif terhadap
 * estimasi; berubah merah bila melebihi estimasi.
 */
export function BudgetPlanner({
  tripId,
  rows,
  totalPlanned,
  totalActual,
  baseCurrency,
}: {
  tripId: string;
  rows: Row[];
  totalPlanned: number;
  totalActual: number;
  baseCurrency: string;
}) {
  const { notify } = useToast();
  const [state, action] = useActionState<ExpenseActionState, FormData>(
    saveBudget,
    null,
  );

  useEffect(() => {
    if (state?.error) notify({ tone: "danger", title: state.error });
  }, [state, notify]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-neutral-500">
          Budget per kategori
        </h3>
        <div className="text-[13px] text-neutral-600">
          Realisasi{" "}
          <span className="font-medium tabular-nums text-neutral-900">
            {formatMoney(totalActual, baseCurrency)}
          </span>{" "}
          / estimasi{" "}
          <span className="tabular-nums">
            {formatMoney(totalPlanned, baseCurrency)}
          </span>
        </div>
      </div>

      <div className="flex flex-col divide-y divide-neutral-200 rounded-2xl border border-white/70 bg-white">
        {BUDGET_CATEGORY_ORDER.map((cat) => {
          const row = rows.find((r) => r.category === cat) ?? {
            category: cat,
            planned: 0,
            actual: 0,
          };
          const meta = BUDGET_CATEGORY_META[cat];
          const Icon = meta.icon;
          const over = row.planned > 0 && row.actual > row.planned;
          const pct =
            row.planned > 0
              ? Math.min(100, Math.round((row.actual / row.planned) * 100))
              : row.actual > 0
                ? 100
                : 0;

          return (
            <div key={cat} className="flex flex-col gap-2 p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-[15px] text-neutral-900">
                  <Icon className="size-4 text-neutral-400" aria-hidden />
                  {meta.label}
                </span>
                <span
                  className={
                    over
                      ? "text-[13px] font-medium tabular-nums text-danger"
                      : "text-[13px] tabular-nums text-neutral-600"
                  }
                >
                  {formatMoney(row.actual, baseCurrency)}
                </span>
              </div>

              <div
                className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100"
                role="presentation"
              >
                <div
                  className={over ? "h-full bg-danger" : "h-full bg-teal-500"}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <form action={action} className="flex items-center gap-2">
                <input type="hidden" name="tripId" value={tripId} />
                <input type="hidden" name="category" value={cat} />
                <label className="sr-only" htmlFor={`budget-${cat}`}>
                  Estimasi {meta.label}
                </label>
                <Input
                  id={`budget-${cat}`}
                  name="amount"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  defaultValue={row.planned || ""}
                  placeholder="Estimasi (kosongkan untuk hapus)"
                  className="h-10"
                />
                <SaveBudgetButton />
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
