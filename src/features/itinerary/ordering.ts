/**
 * Helper murni untuk urutan (order) item itinerary. Dipisah dari Server Action
 * agar mudah diunit-test tanpa database. "order" adalah integer berurutan
 * (0, 1, 2, ...) di dalam satu kontainer: Bucket (dayId null) atau satu hari.
 */

/** Item minimal yang punya id dan order, untuk perhitungan urutan. */
export type Orderable = { id: string; order: number };

/**
 * Hitung order untuk menyisipkan item ke sebuah kontainer pada posisi tertentu.
 * `siblings` adalah item yang sudah ada di kontainer tujuan (tanpa item yang
 * sedang dipindah). `toIndex` di-clamp ke rentang [0, siblings.length].
 * Mengembalikan order final tiap item (termasuk yang disisipkan) sebagai
 * pasangan id-order yang sudah dinormalisasi rapat mulai dari 0.
 */
export function insertAt(
  siblings: Orderable[],
  movedId: string,
  toIndex: number,
): { id: string; order: number }[] {
  const ordered = [...siblings].sort((a, b) => a.order - b.order);
  const clamped = Math.max(0, Math.min(toIndex, ordered.length));
  const ids = ordered.map((s) => s.id);
  ids.splice(clamped, 0, movedId);
  return ids.map((id, index) => ({ id, order: index }));
}

/**
 * Normalisasi ulang order sebuah daftar menjadi 0..n-1 sesuai urutan tampil
 * saat ini. Berguna setelah penghapusan agar tidak ada celah pada order.
 */
export function reindex(items: Orderable[]): { id: string; order: number }[] {
  return [...items]
    .sort((a, b) => a.order - b.order)
    .map((item, index) => ({ id: item.id, order: index }));
}

/**
 * Order untuk menambahkan satu item baru ke akhir kontainer: nilai order
 * terbesar + 1, atau 0 bila kontainer kosong.
 */
export function nextOrder(siblings: Orderable[]): number {
  if (siblings.length === 0) return 0;
  return Math.max(...siblings.map((s) => s.order)) + 1;
}
