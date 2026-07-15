/**
 * Utilitas tanggal berbasis kalender (date-only), bebas timezone.
 * Semua tanggal trip disimpan sebagai @db.Date, jadi kita hanya peduli
 * komponen tahun-bulan-hari, bukan jam. Perhitungan pakai UTC agar tidak
 * bergeser satu hari akibat offset lokal.
 */

/** Parse "YYYY-MM-DD" menjadi Date pada tengah malam UTC. */
export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number) as [
    number,
    number,
    number,
  ];
  return new Date(Date.UTC(year, month - 1, day));
}

/** Format Date menjadi "YYYY-MM-DD" (komponen UTC). */
export function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Selisih hari inklusif antara dua tanggal (end - start + 1). */
export function inclusiveDayCount(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return Math.floor(ms / 86_400_000) + 1;
}

/** Format rentang tanggal untuk tampilan, misal "12 - 15 Jul 2026". */
export function formatDateRange(start: Date, end: Date): string {
  const fmt = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  const sameMonth =
    start.getUTCFullYear() === end.getUTCFullYear() &&
    start.getUTCMonth() === end.getUTCMonth();

  if (sameMonth) {
    const dayFmt = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      timeZone: "UTC",
    });
    return `${dayFmt.format(start)} - ${fmt.format(end)}`;
  }
  return `${fmt.format(start)} - ${fmt.format(end)}`;
}

/**
 * Bangun deretan tanggal harian dari start sampai end (inklusif).
 * Mengembalikan array kosong bila end sebelum start.
 */
export function eachDayInclusive(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const cursor = new Date(start.getTime());
  while (cursor.getTime() <= end.getTime()) {
    days.push(new Date(cursor.getTime()));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}
