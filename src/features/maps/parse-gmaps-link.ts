/**
 * Parser link Google Maps yang aman dan murni (tanpa jaringan, tanpa scraping).
 * Hanya membaca informasi yang memang ada di dalam URL: koordinat dan/atau nama
 * tempat. Dipakai sebagai jalur input alternatif: hasilnya lalu dipakai untuk
 * mencari tempat via provider maps kita (Foursquare), bukan mengambil apa pun
 * dari halaman Google. Modul ini tak punya dependensi server, jadi unit-testable.
 */

export interface ParsedGmapsLink {
  lat: number | null;
  lng: number | null;
  /** Nama/kueri tempat yang terbaca dari URL, sudah di-decode. */
  query: string | null;
}

/** Longgar: cukup terlihat seperti URL Google Maps. */
export function isGmapsLink(input: string): boolean {
  return /(?:google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(
    input.trim(),
  );
}

function parseLatLng(pair: string): { lat: number; lng: number } | null {
  const [a, b] = pair.split(",");
  if (a === undefined || b === undefined) return null;
  const lat = Number(a);
  const lng = Number(b);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

/** Bersihkan token nama tempat dari segmen /place/<name>/. */
function cleanPlaceName(segment: string): string {
  return decodeURIComponent(segment.replace(/\+/g, " ")).trim();
}

/**
 * Ekstrak koordinat dan/atau nama dari berbagai bentuk URL Google Maps.
 * Mengembalikan null hanya jika input jelas bukan tautan yang bisa dibaca.
 * Catatan: link pendek (maps.app.goo.gl) tidak bisa di-resolve tanpa jaringan,
 * jadi hanya dikenali sebagai link; koordinat/nama tak tersedia dari string.
 */
export function parseGmapsLink(input: string): ParsedGmapsLink | null {
  const raw = input.trim();
  if (!raw) return null;

  let lat: number | null = null;
  let lng: number | null = null;
  let query: string | null = null;

  // Koordinat setelah "@": .../@-7.7956,110.3695,15z
  const at = raw.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (at?.[1] && at[2]) {
    const p = parseLatLng(`${at[1]},${at[2]}`);
    if (p) {
      lat = p.lat;
      lng = p.lng;
    }
  }

  // Parameter q= atau query= berisi koordinat atau nama.
  try {
    const url = new URL(raw);
    const q =
      url.searchParams.get("q") ??
      url.searchParams.get("query") ??
      url.searchParams.get("destination");
    if (q) {
      const coord = parseLatLng(q);
      if (coord) {
        lat ??= coord.lat;
        lng ??= coord.lng;
      } else {
        query = cleanPlaceName(q);
      }
    }
    // !3d<lat>!4d<lng> pada URL berbentuk data.
    const d = raw.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (d?.[1] && d[2] && lat === null) {
      const p = parseLatLng(`${d[1]},${d[2]}`);
      if (p) {
        lat = p.lat;
        lng = p.lng;
      }
    }
  } catch {
    // Bukan URL absolut yang valid; lanjut coba pola /place/.
  }

  // Nama tempat dari segmen /place/<name>/
  if (!query) {
    const place = raw.match(/\/place\/([^/@?]+)/);
    if (place?.[1]) {
      const name = cleanPlaceName(place[1]);
      if (name) query = name;
    }
  }

  if (lat === null && lng === null && !query) {
    // Terlihat seperti link Maps (mis. link pendek) tapi tak ada data terbaca.
    return isGmapsLink(raw) ? { lat: null, lng: null, query: null } : null;
  }

  return { lat, lng, query };
}
