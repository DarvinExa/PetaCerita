"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  LinkSimple,
  Copy,
  Check,
  ArrowsClockwise,
  Trash,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { InviteInfo } from "./queries";
import {
  generateInvite,
  revokeInvite,
  type InviteActionState,
} from "./actions";

type ExpiryChoice = "none" | "1" | "7" | "30";

const EXPIRY_LABELS: Record<ExpiryChoice, string> = {
  none: "Tanpa batas",
  "1": "1 hari",
  "7": "7 hari",
  "30": "30 hari",
};

function GenerateButton({ hasInvite }: { hasInvite: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="md" loading={pending}>
      {hasInvite ? (
        <>
          <ArrowsClockwise className="size-4" aria-hidden />
          <span>Buat ulang link</span>
        </>
      ) : (
        <>
          <LinkSimple className="size-4" aria-hidden />
          <span>Buat link undangan</span>
        </>
      )}
    </Button>
  );
}

function RevokeButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="ghost"
      size="md"
      loading={pending}
      className="text-danger hover:bg-danger/5"
    >
      <Trash className="size-4" aria-hidden />
      <span>Cabut</span>
    </Button>
  );
}

/**
 * Panel Owner untuk mengelola invite link: buat, salin, atur kedaluwarsa,
 * buat ulang (token lama langsung mati), dan cabut.
 */
export function InvitePanel({
  tripId,
  invite,
  baseUrl,
}: {
  tripId: string;
  invite: InviteInfo | null;
  baseUrl: string;
}) {
  const { notify } = useToast();
  const [expiry, setExpiry] = useState<ExpiryChoice>("none");
  const [copied, setCopied] = useState(false);

  const [genState, genAction] = useActionState<InviteActionState, FormData>(
    generateInvite,
    null,
  );
  const [revokeState, revokeAction] = useActionState<
    InviteActionState,
    FormData
  >(revokeInvite, null);

  useEffect(() => {
    if (genState?.error) notify({ tone: "danger", title: genState.error });
  }, [genState, notify]);
  useEffect(() => {
    if (revokeState?.error)
      notify({ tone: "danger", title: revokeState.error });
  }, [revokeState, notify]);

  const inviteUrl = invite ? `${baseUrl}/join/${invite.token}` : null;

  async function copyLink() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      notify({ tone: "success", title: "Link disalin" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify({ tone: "danger", title: "Gagal menyalin link" });
    }
  }

  const expiryNote = invite?.expiresAt
    ? invite.isExpired
      ? "Link sudah kedaluwarsa. Buat ulang untuk mengaktifkan."
      : `Berlaku sampai ${new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(invite.expiresAt)}`
    : "Berlaku sampai dicabut atau dibuat ulang.";

  return (
    <div className="flex flex-col gap-4">
      {inviteUrl ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-stretch gap-2">
            <input
              readOnly
              value={inviteUrl}
              aria-label="Link undangan trip"
              onFocus={(e) => e.currentTarget.select()}
              className="min-w-0 flex-1 rounded-md border border-neutral-200 bg-white px-3 text-[13px] text-neutral-700 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={copyLink}
              aria-label="Salin link undangan"
            >
              {copied ? (
                <Check className="size-4 text-success" aria-hidden />
              ) : (
                <Copy className="size-4" aria-hidden />
              )}
              <span>{copied ? "Tersalin" : "Salin"}</span>
            </Button>
          </div>
          <p
            className={
              invite?.isExpired
                ? "text-[13px] text-danger"
                : "text-[13px] text-neutral-600"
            }
          >
            {expiryNote}
          </p>
        </div>
      ) : (
        <p className="text-[13px] text-neutral-600">
          Belum ada link undangan. Buat link agar teman bisa bergabung.
        </p>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <form action={genAction} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="tripId" value={tripId} />
          <input
            type="hidden"
            name="expiresInDays"
            value={expiry === "none" ? "" : expiry}
          />
          <label className="flex flex-col gap-1 text-[13px] text-neutral-600">
            <span>Masa berlaku</span>
            <select
              value={expiry}
              onChange={(e) => setExpiry(e.target.value as ExpiryChoice)}
              className="h-10 rounded-md border border-neutral-200 bg-white px-3 text-[15px] text-neutral-900 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            >
              {(Object.keys(EXPIRY_LABELS) as ExpiryChoice[]).map((key) => (
                <option key={key} value={key}>
                  {EXPIRY_LABELS[key]}
                </option>
              ))}
            </select>
          </label>
          <GenerateButton hasInvite={Boolean(invite)} />
        </form>

        {invite ? (
          <form action={revokeAction}>
            <input type="hidden" name="tripId" value={tripId} />
            <RevokeButton />
          </form>
        ) : null}
      </div>
    </div>
  );
}
