import "server-only";

/**
 * Reverse-geocode gratis via OpenStreetMap Nominatim (tanpa kunci, tanpa
 * billing). Dipakai best-effort untuk mengisi alamat dari koordinat yang
 * diparse dari link Google Maps. Bila gagal, pemanggil menyimpan tempat tanpa
 * alamat, bukan menggagalkan operasi.
 *
 * Kebijakan pemakaian Nominatim: wajib User-Agent yang mengidentifikasi app,
 * dan fair-use ~1 req/detik. Untuk skala MVP ini memadai.
 */

const NOMINATIM = "https://nominatim.openstreetmap.org";
const USER_AGENT = "PetaCerita/1.0 (itinerary planner; contact via app)";

/** Balikkan alamat ringkas dari lat/lng, atau null bila tak tersedia. */
export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<string | null> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: "jsonv2",
    "accept-language": "id",
    zoom: "18",
  });
  try {
    const res = await fetch(`${NOMINATIM}/reverse?${params}`, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      // Alamat sebuah koordinat praktis statis; cache seharian.
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { display_name?: string };
    const name = json.display_name?.trim();
    return name && name.length > 0 ? name : null;
  } catch {
    return null;
  }
}

/**
 * Geocode maju: cari koordinat + alamat dari sebuah nama/kueri tempat. Dipakai
 * saat link hanya memuat nama (mis. link pendek yang sudah diekspansi ke
 * /place/<name>) tanpa koordinat.
 */
export async function geocodeQuery(
  query: string,
): Promise<{ lat: number; lng: number; address: string | null } | null> {
  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    "accept-language": "id",
    limit: "1",
  });
  try {
    const res = await fetch(`${NOMINATIM}/search?${params}`, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) return null;
    const arr = (await res.json()) as {
      lat?: string;
      lon?: string;
      display_name?: string;
    }[];
    const hit = arr[0];
    if (!hit?.lat || !hit.lon) return null;
    const lat = Number(hit.lat);
    const lng = Number(hit.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng, address: hit.display_name?.trim() ?? null };
  } catch {
    return null;
  }
}
