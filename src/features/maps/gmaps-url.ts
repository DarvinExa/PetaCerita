/** Bangun tautan pencarian Google Maps tanpa API atau secret. */
export function googleMapsUrl(opts: {
  sourceUrl?: string | null;
  lat?: number | null;
  lng?: number | null;
  name?: string | null;
}): string {
  const sourceUrl = opts.sourceUrl?.trim();
  if (sourceUrl) {
    try {
      const url = new URL(sourceUrl);
      const host = url.hostname.toLowerCase();
      const officialHost =
        host === "maps.app.goo.gl" ||
        (host === "goo.gl" && url.pathname.startsWith("/maps")) ||
        (/^(?:www\.|maps\.)?google\.[a-z.]+$/.test(host) &&
          (host.startsWith("maps.") || url.pathname.startsWith("/maps")));
      if (
        officialHost &&
        (url.protocol === "https:" || url.protocol === "http:")
      ) {
        return sourceUrl;
      }
    } catch {
      // Gunakan fallback koordinat/nama bila link sumber rusak.
    }
  }
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
