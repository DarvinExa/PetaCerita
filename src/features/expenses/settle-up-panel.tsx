"use client";

import { useTransition } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle,
  ClockCounterClockwise,
  Hourglass,
  PaperPlaneTilt,
  X,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { formatMoney } from "@/lib/money";
import { updateSettlementStatus } from "./actions";
import type { SettlementAction } from "./settlement-state";

type Balance = { memberId: string; name: string; net: number };
type SettlementStatus = "UNPAID" | "PENDING" | "CONFIRMED";
type SettlementEvent = {
  id: string;
  type: "SUBMITTED" | "CANCELLED" | "CONFIRMED" | "REJECTED";
  actorName: string;
  createdAt: string;
};
type Transfer = {
  fromMemberId: string;
  toMemberId: string;
  fromName: string;
  toName: string;
  amount: number;
  status: SettlementStatus;
  submittedAt: string | null;
  settledAt: string | null;
  events: SettlementEvent[];
};

const eventLabels: Record<SettlementEvent["type"], string> = {
  SUBMITTED: "menandai transfer sudah dikirim",
  CANCELLED: "membatalkan pengajuan transfer",
  CONFIRMED: "mengonfirmasi transfer",
  REJECTED: "menolak pengajuan transfer",
};

function formatEventTime(value: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusMeta(status: SettlementStatus) {
  if (status === "CONFIRMED") {
    return {
      label: "Terkonfirmasi",
      badge: "success" as const,
      card: "border-success/30 bg-success/[0.025]",
    };
  }
  if (status === "PENDING") {
    return {
      label: "Menunggu konfirmasi",
      badge: "warning" as const,
      card: "border-warning/30 bg-warning/[0.025]",
    };
  }
  return {
    label: "Belum dibayar",
    badge: "neutral" as const,
    card: "border-white/70 bg-white",
  };
}

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

  function runAction(transfer: Transfer, action: SettlementAction) {
    startTransition(async () => {
      const result = await updateSettlementStatus({
        tripId,
        fromMemberId: transfer.fromMemberId,
        toMemberId: transfer.toMemberId,
        amount: transfer.amount,
        action,
      });
      if (result?.error) {
        notify({ tone: "danger", title: result.error });
        return;
      }
      const messages: Record<SettlementAction, string> = {
        SUBMIT: "Transfer diajukan untuk dikonfirmasi",
        CANCEL: "Pengajuan transfer dibatalkan",
        CONFIRM: "Transfer berhasil dikonfirmasi",
        REJECT: "Pengajuan transfer ditolak",
      };
      notify({ tone: "success", title: messages[action] });
    });
  }

  const allSettled =
    transfers.length > 0 && transfers.every((t) => t.status === "CONFIRMED");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-neutral-500">
          Saldo tiap orang
        </h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {balances.map((balance) => {
            const owed = balance.net < 0;
            const settled = balance.net === 0;
            return (
              <div
                key={balance.memberId}
                className="flex items-center justify-between doodle-box-alt border border-white/70 bg-white px-3 py-2.5 shadow-[0_10px_30px_rgba(15,118,110,0.08)]"
              >
                <span className="text-[14px] font-medium text-neutral-900">
                  {balance.name}
                </span>
                <span
                  className={
                    settled
                      ? "text-[13px] tabular-nums text-neutral-500"
                      : owed
                        ? "text-[13px] font-semibold tabular-nums text-danger"
                        : "text-[13px] font-semibold tabular-nums text-success"
                  }
                >
                  {settled
                    ? "Imbang"
                    : owed
                      ? `Bayar ${formatMoney(-balance.net, baseCurrency)}`
                      : `Terima ${formatMoney(balance.net, baseCurrency)}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <h3 className="text-[13px] font-semibold uppercase tracking-wide text-neutral-500">
            Transfer yang disarankan
          </h3>
          <p className="mt-1 text-[12px] leading-5 text-neutral-500">
            Pengirim menandai transfer, lalu penerima mengonfirmasi dana masuk.
          </p>
        </div>

        {transfers.length === 0 ? (
          <div className="doodle-box-alt border border-dashed border-slate-200/70 bg-white px-4 py-6 text-center">
            <p className="text-[14px] text-neutral-600">
              Belum ada yang perlu ditransfer. Semua sudah imbang.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {transfers.map((transfer) => {
              const isDebtor = currentMemberId === transfer.fromMemberId;
              const isCreditor = currentMemberId === transfer.toMemberId;
              const meta = statusMeta(transfer.status);

              return (
                <li
                  key={`${transfer.fromMemberId}:${transfer.toMemberId}`}
                  className={`doodle-sticker border p-3 shadow-[0_10px_30px_rgba(15,118,110,0.08)] ${meta.card}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 text-[14px]">
                        <span className="font-semibold text-neutral-900">
                          {transfer.fromName}
                        </span>
                        <ArrowRight
                          className="size-4 text-neutral-400"
                          aria-hidden
                        />
                        <span className="font-semibold text-neutral-900">
                          {transfer.toName}
                        </span>
                      </div>
                      <p className="mt-1 text-[18px] font-bold tabular-nums text-neutral-900">
                        {formatMoney(transfer.amount, baseCurrency)}
                      </p>
                    </div>
                    <Badge variant={meta.badge}>{meta.label}</Badge>
                  </div>

                  <div className="mt-3 border-t border-slate-800/20 pt-3">
                    {transfer.status === "UNPAID" && isDebtor ? (
                      <Button
                        type="button"
                        size="sm"
                        loading={pending}
                        onClick={() => runAction(transfer, "SUBMIT")}
                      >
                        <PaperPlaneTilt className="size-4" aria-hidden />
                        <span>Saya sudah transfer</span>
                      </Button>
                    ) : null}

                    {transfer.status === "UNPAID" && !isDebtor ? (
                      <p className="text-[12px] text-neutral-500">
                        Menunggu {transfer.fromName} melakukan transfer.
                      </p>
                    ) : null}

                    {transfer.status === "PENDING" && isCreditor ? (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          loading={pending}
                          onClick={() => runAction(transfer, "CONFIRM")}
                        >
                          <Check className="size-4" aria-hidden />
                          <span>Konfirmasi masuk</span>
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          loading={pending}
                          onClick={() => runAction(transfer, "REJECT")}
                        >
                          <X className="size-4" aria-hidden />
                          <span>Tolak</span>
                        </Button>
                      </div>
                    ) : null}

                    {transfer.status === "PENDING" && isDebtor ? (
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[12px] text-warning">
                          <Hourglass className="size-4" aria-hidden />
                          Menunggu {transfer.toName} mengonfirmasi
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          loading={pending}
                          onClick={() => runAction(transfer, "CANCEL")}
                        >
                          Batalkan
                        </Button>
                      </div>
                    ) : null}

                    {transfer.status === "PENDING" &&
                    !isDebtor &&
                    !isCreditor ? (
                      <p className="inline-flex items-center gap-1.5 text-[12px] text-warning">
                        <Hourglass className="size-4" aria-hidden />
                        Menunggu konfirmasi {transfer.toName}
                      </p>
                    ) : null}

                    {transfer.status === "CONFIRMED" ? (
                      <p className="inline-flex items-center gap-1.5 text-[12px] font-medium text-success">
                        <CheckCircle className="size-4" aria-hidden />
                        Dana sudah diterima dan dikonfirmasi
                      </p>
                    ) : null}
                  </div>

                  {transfer.events.length > 0 ? (
                    <details className="mt-3 border-t border-slate-800/20 pt-2">
                      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-1.5 doodle-sticker text-[12px] font-medium text-neutral-600 hover:text-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">
                        <ClockCounterClockwise className="size-4" aria-hidden />
                        Riwayat status
                      </summary>
                      <ol className="mt-2 flex flex-col gap-2 border-l border-white/70 pl-3">
                        {transfer.events.map((event) => (
                          <li
                            key={event.id}
                            className="text-[12px] leading-5 text-neutral-600"
                          >
                            <span className="font-medium text-neutral-800">
                              {event.actorName}
                            </span>{" "}
                            {eventLabels[event.type]}
                            <span className="block text-neutral-400">
                              {formatEventTime(event.createdAt)}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </details>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}

        {allSettled ? (
          <p className="inline-flex items-center gap-1.5 text-[13px] font-medium text-success">
            <CheckCircle className="size-4" aria-hidden />
            Semua transfer sudah dikonfirmasi.
          </p>
        ) : null}
      </div>
    </div>
  );
}
