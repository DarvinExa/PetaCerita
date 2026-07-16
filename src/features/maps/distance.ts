export type GeoPoint = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

export type RouteSegment = {
  from: GeoPoint;
  to: GeoPoint;
  distanceKm: number;
};

const EARTH_RADIUS_KM = 6371.0088;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Jarak garis lurus antar-koordinat memakai rumus haversine. */
export function haversineKm(
  a: Pick<GeoPoint, "lat" | "lng">,
  b: Pick<GeoPoint, "lat" | "lng">,
): number {
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const deltaLat = toRadians(b.lat - a.lat);
  const deltaLng = toRadians(b.lng - a.lng);
  const sinLat = Math.sin(deltaLat / 2);
  const sinLng = Math.sin(deltaLng / 2);
  const value =
    sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  const centralAngle = 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
  return EARTH_RADIUS_KM * centralAngle;
}

export function routeSegments(points: GeoPoint[]): RouteSegment[] {
  return points.slice(1).map((point, index) => ({
    from: points[index]!,
    to: point,
    distanceKm: haversineKm(points[index]!, point),
  }));
}

export function totalHaversineKm(points: GeoPoint[]): number {
  return routeSegments(points).reduce(
    (total, segment) => total + segment.distanceKm,
    0,
  );
}

export type DistanceLevel = "NEAR" | "MEDIUM" | "FAR";

/** Ambang heuristik perjalanan dalam kota, bukan estimasi jarak berkendara. */
export function distanceLevel(distanceKm: number): DistanceLevel {
  if (distanceKm <= 5) return "NEAR";
  if (distanceKm <= 15) return "MEDIUM";
  return "FAR";
}

export function nearestPoint(
  candidate: GeoPoint,
  points: GeoPoint[],
): { point: GeoPoint; distanceKm: number } | null {
  let nearest: { point: GeoPoint; distanceKm: number } | null = null;
  for (const point of points) {
    const distanceKm = haversineKm(candidate, point);
    if (!nearest || distanceKm < nearest.distanceKm) {
      nearest = { point, distanceKm };
    }
  }
  return nearest;
}

export function formatDistanceKm(distanceKm: number): string {
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: distanceKm < 10 ? 1 : 0,
  }).format(distanceKm)} km`;
}
