import {
  Car,
  Bed,
  ForkKnife,
  Ticket,
  DotsThreeCircle,
  type Icon,
} from "@phosphor-icons/react";
import { BUDGET_CATEGORIES } from "./validation";

/**
 * Metadata kategori budget untuk tampilan (label Indonesia, ikon Phosphor).
 * Aman dipakai di Client Component: hanya konstanta dan tipe, tidak menyentuh
 * Prisma runtime. Urutan mengikuti BUDGET_CATEGORIES.
 */
export type BudgetCategory = (typeof BUDGET_CATEGORIES)[number];

// Re-export agar komponen bisa mengambil daftar/urutan kategori dari satu tempat.
export { BUDGET_CATEGORIES };
export const BUDGET_CATEGORY_ORDER = BUDGET_CATEGORIES;

export const BUDGET_CATEGORY_META: Record<
  BudgetCategory,
  { label: string; icon: Icon }
> = {
  TRANSPORT: { label: "Transport", icon: Car },
  PENGINAPAN: { label: "Penginapan", icon: Bed },
  MAKAN: { label: "Makan", icon: ForkKnife },
  TIKET: { label: "Tiket", icon: Ticket },
  LAINNYA: { label: "Lainnya", icon: DotsThreeCircle },
};

/** Metadata kategori dari string sembarang; null bila bukan kategori valid. */
export function budgetCategoryMeta(
  category: string | null,
): { label: string; icon: Icon } | null {
  if (category && category in BUDGET_CATEGORY_META) {
    return BUDGET_CATEGORY_META[category as BudgetCategory];
  }
  return null;
}
