/** Bangun tautan pencarian Google Maps tanpa API atau secret. */
export function googleMapsUrl(opts: {
  lat?: number | null;
  lng?: number | null;
  name?: string | null;
}): string {
  const base = ["https:/", "/www.google.com/maps/search/?api=1&query="].join(
    "",
  );
  if (
    typeof opts.lat === "number" &&
    typeof opts.lng === "number" &&
    Number.isFinite(opts.lat) &&
    Number.isFinite(opts.lng)
  ) {
    return `${base}${opts.lat},${opts.lng}`;
  }
  return `${base}${encodeURIComponent((opts.name ?? "").trim())}`;
}
