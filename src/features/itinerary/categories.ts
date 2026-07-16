import type { ItineraryCategory } from "@prisma/client";
import {
  Mountains,
  FilmSlate,
  ForkKnife,
  Bed,
  Car,
  type Icon,
} from "@phosphor-icons/react";
import type { BadgeProps } from "@/components/ui/badge";

/**
 * Metadata kategori untuk tampilan (label Indonesia, ikon Phosphor, warna
 * badge). Aman dipakai di client karena tidak menyentuh Prisma runtime, hanya
 * tipe. Urutan CATEGORY_ORDER dipakai untuk isi dropdown secara konsisten.
 */
export const CATEGORY_ORDER = [
  "ALAM",
  "ENTERTAIN",
  "KULINER",
  "PENGINAPAN",
  "TRANSPORT",
] as const satisfies readonly ItineraryCategory[];

interface CategoryMeta {
  label: string;
  icon: Icon;
  badge: NonNullable<BadgeProps["variant"]>;
}

export const CATEGORY_META: Record<ItineraryCategory, CategoryMeta> = {
  ALAM: { label: "Alam", icon: Mountains, badge: "success" },
  ENTERTAIN: { label: "Hiburan", icon: FilmSlate, badge: "info" },
  KULINER: { label: "Kuliner", icon: ForkKnife, badge: "warning" },
  PENGINAPAN: { label: "Penginapan", icon: Bed, badge: "teal" },
  TRANSPORT: { label: "Transport", icon: Car, badge: "neutral" },
};
