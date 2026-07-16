/**
 * Format uang untuk tampilan. Nilai disimpan sebagai integer minor unit; untuk
 * IDR itu berarti rupiah utuh tanpa desimal (lihat komentar model ItineraryItem
 * di schema.prisma). Selalu format lokal dengan simbol mata uang trip.
 */
export function formatMoney(amount: number, currency = "IDR"): string {
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Kode mata uang tak dikenal: fallback ke angka berpemisah ribuan.
    return `${currency} ${new Intl.NumberFormat("id-ID").format(amount)}`;
  }
}
