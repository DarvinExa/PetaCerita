"use client";

import { useTransition } from "react";
import { ArrowRight, Check, CheckCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { formatMoney } from "@/lib/money";
import { markPaid } from "./actions";

type Balance = { memberId: string; name: string; net: number };
type Transfer = {
  fromMemberId: string;
  toMemberId: string;
  fromName: string;
  toName: string;
  amount: number;
  paid: boolean;
};

/**
 * Panel Settle Up: saldo net tiap anggota dan daftar transfer minimal. Hanya
 * penerima (kreditur) yang melihat tombol tandai lunas untuk transfer ke dia,
 * sesuai aturan server (cek userId penerima). currentMemberId adalah id
 * keanggotaan user yang sedang login pada trip ini (null bila entah kenapa
 * tidak ketemu).
 */
export function SettleUpPanel({
  tripId,
  balances,
  transfers,
  currentMemberId,
  baseCurrency,
}: {
  tripId: string;
  balances: Balance[];
  transfers: Transfer[];
  currentMemberId: string | null;
  baseCurrency: string;
}) {
  const { notify } = useToast();
  const [pending, startTransition] = useTransition();

  function setPaid(t: Transfer, paid: boolean) {
    startTransition(async () => {
      const result = await markPaid({
        tripId,
        fromMemberId: t.fromMemberId,
        toMemberId: t.toMemberId,
        amount: t.amount,
        paid,
      });
      if (result?.error) {
        notify({ tone: "danger", title: result.error });
        return;
      }
      notify({
        tone: "success",
        title: paid ? "Ditandai lunas" : "Tanda lunas dibatalkan",
      });
    });
  }

  const allSettled = transfers.length > 0 && transfers.every((t) => t.paid);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-neutral-500">
          Saldo tiap orang
        </h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {balances.map((b) => {
            const owed = b.net < 0;
            const settled = b.net === 0;
            return (
              <div
                key={b.memberId}
                className="flex items-center justify-between rounded-md border border-neutral-200 bg-white px-3 py-2"
              >
                <span className="text-[15px] text-neutral-900">{b.name}</span>
                <span
                  className={
                    settled
                      ? "text-[15px] tabular-nums text-neutral-500"
                      : owed
                        ? "text-[15px] font-medium tabular-nums text-danger"
                        : "text-[15px] font-medium tabular-nums text-success"
                  }
                >
                  {settled
                    ? "Lunas"
                    : owed
                      ? `Bayar ${formatMoney(-b.net, baseCurrency)}`
                      : `Terima ${formatMoney(b.net, baseCurrency)}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-neutral-500">
          Transfer yang disarankan
        </h3>

        {transfers.length === 0 ? (
          <div className="rounded-md border border-dashed border-neutral-300 bg-white px-4 py-6 text-center">
            <p className="text-[15px] text-neutral-600">
              Belum ada yang perlu ditransfer. Semua sudah imbang.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {transfers.map((t) => {
              const canMark =
                currentMemberId !== null && currentMemberId === t.toMemberId;
              return (
                <li
                  key={`${t.fromMemberId}:${t.toMemberId}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-neutral-200 bg-white px-3 py-2.5"
                >
                  <div className="flex items-center gap-2 text-[15px]">
                    <span className="font-medium text-neutral-900">
                      {t.fromName}
                    </span>
                    <ArrowRight
                      className="size-4 text-neutral-400"
                      aria-hidden
                    />
                    <span className="font-medium text-neutral-900">
                      {t.toName}
                    </span>
                    <span className="tabular-nums text-neutral-600">
                      {formatMoney(t.amount, baseCurrency)}
                    </span>
                  </div>

                  {t.paid ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[13px] font-medium text-success">
                        <CheckCircle className="size-4" aria-hidden />
                        Lunas
                      </span>
                      {canMark ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          loading={pending}
                          onClick={() => setPaid(t, false)}
                        >
                          Batalkan
                        </Button>
                      ) : null}
                    </div>
                  ) : canMark ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      loading={pending}
                      onClick={() => setPaid(t, true)}
                    >
                      <Check className="size-4" aria-hidden />
                      <span>Tandai lunas</span>
                    </Button>
                  ) : (
                    <span className="text-[13px] text-neutral-400">
                      Menunggu {t.toName}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {allSettled ? (
          <p className="inline-flex items-center gap-1.5 text-[13px] text-success">
            <CheckCircle className="size-4" aria-hidden />
            Semua transfer sudah lunas.
          </p>
        ) : null}
      </div>
    </div>
  );
}
