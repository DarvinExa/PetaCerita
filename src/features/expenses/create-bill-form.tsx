"use client";

import { useState, useTransition } from "react";
import { Plus, Trash, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input, FormField } from "@/components/ui/input";
import { Modal, ModalTrigger, ModalContent } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { formatMoney } from "@/lib/money";
import { createExpense } from "./actions";
import { evenShares } from "./money";
import {
  BUDGET_CATEGORY_ORDER,
  BUDGET_CATEGORY_META,
} from "./budget-categories";
import type { CreateExpenseInput } from "./validation";

type Member = { id: string; name: string };

/** Baris item di form: peserta dipilih lewat checkbox; share dibagi rata. */
type DraftItem = {
  key: string;
  name: string;
  amount: string;
  isShared: boolean;
  participants: Set<string>;
};

let keyCounter = 0;
function newItem(allIds: string[]): DraftItem {
  keyCounter += 1;
  return {
    key: `item-${keyCounter}`,
    name: "",
    amount: "",
    isShared: false,
    participants: new Set(allIds),
  };
}

/** Parse rupiah utuh dari input teks; NaN atau negatif jadi 0. */
function parseAmount(v: string): number {
  const n = Number(v.replace(/[^\d]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

/**
 * Form buat bill: pilih payer, tambah beberapa item, tiap item pilih peserta
 * (default semua, bagi rata). Item bisa ditandai biaya bersama (pajak/parkir).
 * Share dihitung rata di client dengan largest remainder yang sama seperti
 * server, jadi jumlah share selalu cocok dengan harga item saat divalidasi.
 */
export function CreateBillForm({
  tripId,
  members,
  baseCurrency,
  defaultPayerId,
}: {
  tripId: string;
  members: Member[];
  baseCurrency: string;
  defaultPayerId: string;
}) {
  const { notify } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const allIds = members.map((m) => m.id);
  const today = new Date().toISOString().slice(0, 10);

  const [payerId, setPayerId] = useState(defaultPayerId);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(today);
  const [budgetCategory, setBudgetCategory] = useState<string>("");
  const [items, setItems] = useState<DraftItem[]>(() => [newItem(allIds)]);

  function reset() {
    setPayerId(defaultPayerId);
    setTitle("");
    setDate(today);
    setBudgetCategory("");
    setItems([newItem(allIds)]);
  }

  function updateItem(key: string, patch: Partial<DraftItem>) {
    setItems((prev) =>
      prev.map((it) => (it.key === key ? { ...it, ...patch } : it)),
    );
  }

  function toggleParticipant(key: string, memberId: string) {
    setItems((prev) =>
      prev.map((it) => {
        if (it.key !== key) return it;
        const next = new Set(it.participants);
        if (next.has(memberId)) next.delete(memberId);
        else next.add(memberId);
        return { ...it, participants: next };
      }),
    );
  }

  const total = items.reduce((a, it) => a + parseAmount(it.amount), 0);

  function submit() {
    if (!title.trim()) {
      notify({ tone: "danger", title: "Judul bill wajib diisi" });
      return;
    }
    // Bentuk payload sesuai createExpenseSchema. Untuk item biasa, hitung share
    // rata di sini agar jumlahnya cocok dengan harga item.
    const payloadItems: CreateExpenseInput["items"] = [];
    for (const it of items) {
      const amount = parseAmount(it.amount);
      if (!it.name.trim()) {
        notify({ tone: "danger", title: "Setiap item butuh nama" });
        return;
      }
      if (amount <= 0) {
        notify({ tone: "danger", title: `Harga "${it.name}" tidak valid` });
        return;
      }
      if (it.isShared) {
        payloadItems.push({
          name: it.name.trim(),
          amount,
          isShared: true,
          shares: [],
        });
        continue;
      }
      const participantIds = allIds.filter((id) => it.participants.has(id));
      if (participantIds.length === 0) {
        notify({
          tone: "danger",
          title: `"${it.name}" butuh minimal 1 peserta`,
        });
        return;
      }
      payloadItems.push({
        name: it.name.trim(),
        amount,
        isShared: false,
        shares: evenShares(amount, participantIds),
      });
    }

    const input: CreateExpenseInput = {
      tripId,
      payerId,
      title: title.trim(),
      date,
      currency: baseCurrency,
      exchangeRateToBase: 1,
      budgetCategory: budgetCategory
        ? (budgetCategory as CreateExpenseInput["budgetCategory"])
        : null,
      items: payloadItems,
    };

    startTransition(async () => {
      const result = await createExpense(input);
      if (result?.error) {
        notify({ tone: "danger", title: result.error });
        return;
      }
      notify({ tone: "success", title: "Bill tersimpan" });
      reset();
      setOpen(false);
    });
  }

  const selectClass =
    "h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-[15px] text-neutral-900 outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-1";

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <ModalTrigger asChild>
        <Button variant="primary" size="md">
          <Plus className="size-4" aria-hidden />
          <span>Buat bill</span>
        </Button>
      </ModalTrigger>
      <ModalContent
        title="Buat bill"
        description="Catat siapa yang bayar dan bagi per item ke peserta."
        className="max-h-[85vh] overflow-y-auto"
      >
        <div className="flex flex-col gap-4">
          <FormField label="Judul" htmlFor="bill-title" required>
            <Input
              id="bill-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={160}
              placeholder="mis. Makan malam di resto"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Yang bayar" htmlFor="bill-payer" required>
              <select
                id="bill-payer"
                value={payerId}
                onChange={(e) => setPayerId(e.target.value)}
                className={selectClass}
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Tanggal" htmlFor="bill-date" required>
              <Input
                id="bill-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </FormField>
          </div>

          <FormField
            label="Kategori budget"
            htmlFor="bill-category"
            helperText="Opsional. Untuk membandingkan estimasi vs realisasi."
          >
            <select
              id="bill-category"
              value={budgetCategory}
              onChange={(e) => setBudgetCategory(e.target.value)}
              className={selectClass}
            >
              <option value="">Tanpa kategori</option>
              {BUDGET_CATEGORY_ORDER.map((c) => (
                <option key={c} value={c}>
                  {BUDGET_CATEGORY_META[c].label}
                </option>
              ))}
            </select>
          </FormField>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold uppercase tracking-wide text-neutral-500">
                Item
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setItems((prev) => [...prev, newItem(allIds)])}
              >
                <Plus className="size-4" aria-hidden />
                <span>Tambah item</span>
              </Button>
            </div>

            {items.map((it) => (
              <div
                key={it.key}
                className="flex flex-col gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-3"
              >
                <div className="flex items-start gap-2">
                  <div className="grid flex-1 grid-cols-[1fr_auto] gap-2">
                    <Input
                      value={it.name}
                      onChange={(e) =>
                        updateItem(it.key, { name: e.target.value })
                      }
                      maxLength={120}
                      placeholder="Nama item"
                      aria-label="Nama item"
                    />
                    <Input
                      value={it.amount}
                      onChange={(e) =>
                        updateItem(it.key, { amount: e.target.value })
                      }
                      inputMode="numeric"
                      className="w-32 text-right tabular-nums"
                      placeholder="0"
                      aria-label="Harga item"
                    />
                  </div>
                  {items.length > 1 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setItems((prev) => prev.filter((x) => x.key !== it.key))
                      }
                      aria-label="Hapus item"
                      className="mt-2 rounded p-1 text-neutral-400 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                    >
                      <Trash className="size-4" aria-hidden />
                    </button>
                  ) : null}
                </div>

                <label className="flex items-center gap-2 text-[13px] text-neutral-700">
                  <input
                    type="checkbox"
                    checked={it.isShared}
                    onChange={(e) =>
                      updateItem(it.key, { isShared: e.target.checked })
                    }
                    className="size-4 rounded border-neutral-300 text-teal-600 focus-visible:ring-teal-600"
                  />
                  <span>
                    Biaya bersama (pajak, parkir) - dibagi rata otomatis
                  </span>
                </label>

                {!it.isShared ? (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-medium text-neutral-500">
                      Peserta item ini
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {members.map((m) => {
                        const active = it.participants.has(m.id);
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => toggleParticipant(it.key, m.id)}
                            className={
                              active
                                ? "inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-[13px] text-teal-800"
                                : "inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[13px] text-neutral-500"
                            }
                            aria-pressed={active}
                          >
                            {m.name}
                            {active ? (
                              <X className="size-3" aria-hidden />
                            ) : (
                              <Plus className="size-3" aria-hidden />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-neutral-200 pt-3">
            <span className="text-[15px] text-neutral-600">Total</span>
            <span className="text-[17px] font-semibold text-neutral-900 tabular-nums">
              {formatMoney(total, baseCurrency)}
            </span>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" onClick={submit} loading={pending}>
              Simpan bill
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
