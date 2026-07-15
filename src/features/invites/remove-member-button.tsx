"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { UserMinus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { removeMember, type InviteActionState } from "./actions";

function SubmitButton({ memberName }: { memberName: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="ghost"
      size="sm"
      loading={pending}
      aria-label={`Keluarkan ${memberName} dari trip`}
      className="text-danger hover:bg-danger/5"
    >
      <UserMinus className="size-4" aria-hidden />
      <span>Keluarkan</span>
    </Button>
  );
}

/** Tombol owner untuk mengeluarkan seorang anggota. Konfirmasi via dialog native. */
export function RemoveMemberButton({
  tripId,
  memberId,
  memberName,
  onError,
}: {
  tripId: string;
  memberId: string;
  memberName: string;
  onError?: (message: string) => void;
}) {
  const [state, formAction] = useActionState<InviteActionState, FormData>(
    removeMember,
    null,
  );

  useEffect(() => {
    if (state?.error) onError?.(state.error);
  }, [state, onError]);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm(`Keluarkan ${memberName} dari trip ini?`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="tripId" value={tripId} />
      <input type="hidden" name="memberId" value={memberId} />
      <SubmitButton memberName={memberName} />
    </form>
  );
}
