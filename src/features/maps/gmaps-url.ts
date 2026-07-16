/**
 * Bangun URL "Buka di Google Maps" tanpa API apa pun. Hanya menyusun tautan
 * publik yang bisa diklik user. Prioritas: koordinat (paling presisi), lalu
 * nama tempat sebagai kueri pencarian.
 */
export function googleMapsUrl(opts: {
  lat?: number | null;
  lng?: number | null;
  name?: string | null;
}): string {
  if (
    typeof opts.lat === "number" &&
    typeof opts.lng === "number" &&
    Number.isFinite(opts.lat) &&
    Number.isFinite(opts.lng)
  ) {
    return `https://www.google.com/maps/search/?api=1&query=${opts.lat},${opts.lng}`;
  }
  const q = encodeURIComponent((opts.name ?? "").trim());
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}
