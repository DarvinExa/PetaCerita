"use client";

import { useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { RemoveMemberButton } from "./remove-member-button";

export interface MemberRow {
  id: string;
  name: string;
  role: "OWNER" | "MEMBER";
  isSelf: boolean;
}

/** Inisial dari nama untuk avatar teks. Ambil sampai dua kata pertama. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

/**
 * Daftar anggota trip. Owner melihat tombol keluarkan pada tiap anggota
 * (kecuali dirinya dan Owner lain). Non-owner hanya melihat daftar.
 */
export function MemberList({
  tripId,
  members,
  canManage,
}: {
  tripId: string;
  members: MemberRow[];
  canManage: boolean;
}) {
  const { notify } = useToast();
  const onError = useCallback(
    (message: string) => notify({ tone: "danger", title: message }),
    [notify],
  );

  return (
    <ul className="flex flex-col divide-y divide-neutral-200 rounded-2xl border border-white/70 bg-white">
      {members.map((member) => (
        <li key={member.id} className="flex items-center gap-3 px-4 py-3">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-[13px] font-semibold text-teal-800"
            aria-hidden
          >
            {initials(member.name)}
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[15px] font-medium text-neutral-900">
              {member.name}
              {member.isSelf ? (
                <span className="text-neutral-400"> (kamu)</span>
              ) : null}
            </span>
          </div>
          <Badge variant={member.role === "OWNER" ? "teal" : "neutral"}>
            {member.role === "OWNER" ? "Owner" : "Anggota"}
          </Badge>
          {canManage && member.role !== "OWNER" && !member.isSelf ? (
            <RemoveMemberButton
              tripId={tripId}
              memberId={member.id}
              memberName={member.name}
              onError={onError}
            />
          ) : null}
        </li>
      ))}
    </ul>
  );
}
