"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input, FormField } from "@/components/ui/input";
import { Modal, ModalTrigger, ModalContent } from "@/components/ui/modal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { PlaceLinkForm } from "@/features/maps/place-link-form";
import { createPlace, type ItineraryActionState } from "./actions";
import { CATEGORY_ORDER, CATEGORY_META } from "./categories";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      Tambah ke Bucket
    </Button>
  );
}

/** Form manual: dipakai sebagai tab kedua, atau satu-satunya bila maps nonaktif. */
function ManualForm({
  tripId,
  onDone,
}: {
  tripId: string;
  onDone: () => void;
}) {
  const { notify } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action] = useActionState<ItineraryActionState, FormData>(
    createPlace,
    null,
  );

  useEffect(() => {
    if (state?.error) notify({ tone: "danger", title: state.error });
  }, [state, notify]);

  return (
    <form
      ref={formRef}
      action={(formData) => {
        action(formData);
      }}
      className="flex flex-col gap-4"
      onSubmit={() => {
        // Tutup optimistis; error tetap muncul lewat toast bila gagal.
        setTimeout(() => {
          formRef.current?.reset();
          onDone();
        }, 0);
      }}
    >
      <input type="hidden" name="tripId" value={tripId} />

      <FormField label="Nama tempat" htmlFor="place-name" required>
        <Input
          id="place-name"
          name="name"
          required
          maxLength={120}
          placeholder="mis. Pantai Kesirat"
          autoComplete="off"
        />
      </FormField>

      <FormField label="Kategori" htmlFor="place-category" required>
        <select
          id="place-category"
          name="category"
          required
          defaultValue="KULINER"
          className="doodle-input h-10 w-full doodle-box-alt border border-white/70 bg-white px-3 text-[15px] text-neutral-900 outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-1"
        >
          {CATEGORY_ORDER.map((key) => (
            <option key={key} value={key}>
              {CATEGORY_META[key].label}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Alamat" htmlFor="place-address" helperText="Opsional">
        <Input
          id="place-address"
          name="address"
          maxLength={300}
          placeholder="Opsional"
          autoComplete="off"
        />
      </FormField>

      <FormField label="Catatan" htmlFor="place-note" helperText="Opsional">
        <Input
          id="place-note"
          name="note"
          maxLength={1000}
          placeholder="Opsional"
          autoComplete="off"
        />
      </FormField>

      <div className="mt-1 flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}

/**
 * Tambah tempat ke Bucket Ide. Tab "Dari Link" jadi utama: tempel link Google
 * Maps, sistem tarik nama, alamat, dan koordinat otomatis (gratis). Tab
 * "Manual" untuk memasukkan tempat tanpa link.
 */
export function AddPlaceForm({ tripId }: { tripId: string }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalTrigger asChild>
        <Button variant="secondary" size="sm">
          <Plus className="size-4" aria-hidden />
          <span>Tambah tempat</span>
        </Button>
      </ModalTrigger>
      <ModalContent
        title="Tambah tempat"
        description="Simpan kandidat tempat ke Bucket Ide. Jadwalkan ke hari lewat drag."
      >
        <Tabs defaultValue="link">
          <TabsList className="mb-4">
            <TabsTrigger value="link">Dari Link</TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
          </TabsList>
          <TabsContent value="link">
            <PlaceLinkForm tripId={tripId} onDone={close} />
          </TabsContent>
          <TabsContent value="manual">
            <ManualForm tripId={tripId} onDone={close} />
          </TabsContent>
        </Tabs>
      </ModalContent>
    </Modal>
  );
}
