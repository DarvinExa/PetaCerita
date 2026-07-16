"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Warning } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input, FormField } from "@/components/ui/input";
import { createTrip, type CreateTripState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" loading={pending}>
      Buat Trip
    </Button>
  );
}

/** Hitung jumlah hari inklusif dari dua string tanggal, atau null bila invalid. */
function dayCount(start: string, end: string): number | null {
  if (!start || !end) return null;
  const s = Date.parse(`${start}T00:00:00Z`);
  const e = Date.parse(`${end}T00:00:00Z`);
  if (Number.isNaN(s) || Number.isNaN(e) || e < s) return null;
  return Math.floor((e - s) / 86_400_000) + 1;
}

export function CreateTripForm() {
  const [state, formAction] = useActionState<CreateTripState, FormData>(
    createTrip,
    null,
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const days = dayCount(startDate, endDate);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state?.error ? (
        <div
          role="alert"
          className="flex items-start gap-2 doodle-box-alt border border-danger/30 bg-danger/5 px-3 py-2.5 text-[13px] text-danger"
        >
          <Warning className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{state.error}</span>
        </div>
      ) : null}

      <FormField label="Nama trip" htmlFor="name" required>
        <Input
          id="name"
          name="name"
          placeholder="Liburan ke Bali"
          maxLength={100}
          required
        />
      </FormField>

      <FormField label="Kota tujuan" htmlFor="city" required>
        <Input
          id="city"
          name="city"
          placeholder="Denpasar"
          maxLength={100}
          required
        />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Tanggal mulai" htmlFor="startDate" required>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </FormField>
        <FormField
          label="Tanggal selesai"
          htmlFor="endDate"
          required
          helperText={days ? `${days} hari perjalanan` : undefined}
        >
          <Input
            id="endDate"
            name="endDate"
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </FormField>
      </div>

      <FormField
        label="Mata uang dasar"
        htmlFor="baseCurrency"
        helperText="Kode 3 huruf, mis. IDR, USD, SGD"
      >
        <Input
          id="baseCurrency"
          name="baseCurrency"
          defaultValue="IDR"
          maxLength={3}
          className="uppercase"
          style={{ textTransform: "uppercase" }}
        />
      </FormField>

      <div className="flex justify-end gap-2">
        <SubmitButton />
      </div>
    </form>
  );
}
