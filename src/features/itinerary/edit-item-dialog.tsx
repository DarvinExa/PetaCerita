"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Trash } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input, FormField } from "@/components/ui/input";
import { Modal, ModalContent } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { updateItem, deleteItem, type ItineraryActionState } from "./actions";
import { CATEGORY_ORDER, CATEGORY_META } from "./categories";
import type { BoardItem } from "./types";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      Simpan
    </Button>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="ghost"
      loading={pending}
      className="text-danger hover:bg-danger/5"
    >
      <Trash className="size-4" aria-hidden />
      <span>Hapus</span>
    </Button>
  );
}

/**
 * Dialog edit satu item itinerary: kategori, waktu mulai dan selesai, catatan,
 * dan perkiraan biaya. Juga bisa menghapus item. Dikendalikan lewat prop item:
 * item non-null berarti dialog terbuka. onClose menutupnya.
 */
export function EditItemDialog({
  item,
  tripId,
  onClose,
}: {
  item: BoardItem | null;
  tripId: string;
  onClose: () => void;
}) {
  const { notify } = useToast();
  const [updateState, updateAction] = useActionState<
    ItineraryActionState,
    FormData
  >(updateItem, null);
  const [deleteState, deleteAction] = useActionState<
    ItineraryActionState,
    FormData
  >(deleteItem, null);

  useEffect(() => {
    if (updateState?.error)
      notify({ tone: "danger", title: updateState.error });
  }, [updateState, notify]);

  useEffect(() => {
    if (deleteState?.error) {
      notify({ tone: "danger", title: deleteState.error });
    }
  }, [deleteState, notify]);

  return (
    <Modal open={item !== null} onOpenChange={(o) => !o && onClose()}>
      {item ? (
        <ModalContent
          title={item.place.name}
          description={item.place.address ?? "Atur detail kunjungan"}
        >
          <form
            action={(formData) => updateAction(formData)}
            onSubmit={() => setTimeout(onClose, 0)}
            className="flex flex-col gap-4"
          >
            <input type="hidden" name="tripId" value={tripId} />
            <input type="hidden" name="itemId" value={item.id} />

            <FormField label="Kategori" htmlFor="edit-category" required>
              <select
                id="edit-category"
                name="category"
                defaultValue={item.category}
                className="doodle-input h-10 w-full doodle-box-alt border border-white/70 bg-white px-3 text-[15px] text-neutral-900 outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-1"
              >
                {CATEGORY_ORDER.map((key) => (
                  <option key={key} value={key}>
                    {CATEGORY_META[key].label}
                  </option>
                ))}
              </select>
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Mulai" htmlFor="edit-start">
                <Input
                  id="edit-start"
                  name="startTime"
                  type="time"
                  defaultValue={item.startTime ?? ""}
                />
              </FormField>
              <FormField label="Selesai" htmlFor="edit-end">
                <Input
                  id="edit-end"
                  name="endTime"
                  type="time"
                  defaultValue={item.endTime ?? ""}
                />
              </FormField>
            </div>

            <FormField
              label="Perkiraan biaya"
              htmlFor="edit-cost"
              helperText="Dalam rupiah, tanpa titik. Kosongkan bila belum tahu."
            >
              <Input
                id="edit-cost"
                name="estimatedCost"
                inputMode="numeric"
                pattern="[0-9]*"
                defaultValue={item.estimatedCost ?? ""}
                placeholder="mis. 50000"
              />
            </FormField>

            <FormField label="Catatan" htmlFor="edit-note">
              <Input
                id="edit-note"
                name="note"
                maxLength={1000}
                defaultValue={item.note ?? ""}
                placeholder="Opsional"
              />
            </FormField>

            <div className="mt-1 flex items-center justify-between">
              <span />
              <SaveButton />
            </div>
          </form>

          <div className="mt-4 border-t border-white/70 pt-4">
            <form
              action={(formData) => deleteAction(formData)}
              onSubmit={() => setTimeout(onClose, 0)}
            >
              <input type="hidden" name="tripId" value={tripId} />
              <input type="hidden" name="itemId" value={item.id} />
              <DeleteButton />
            </form>
          </div>
        </ModalContent>
      ) : null}
    </Modal>
  );
}
