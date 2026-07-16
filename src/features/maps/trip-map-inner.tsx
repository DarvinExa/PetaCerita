"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { googleMapsUrl } from "./gmaps-url";

/**
 * Peta trip berbasis Leaflet + tile OpenStreetMap (gratis, tanpa kunci). Hanya
 * dirender di client (lihat trip-map.tsx yang meng-import dinamis, ssr:false),
 * karena Leaflet menyentuh window/document.
 */

export type MapPoint = {
  id: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
};

// Bundler mengubah aset ikon jadi objek; Leaflet default menebak path relatif
// yang salah. Set ikon default secara eksplisit agar pin tampil.
const iconUrl = typeof markerIcon === "string" ? markerIcon : markerIcon.src;
const iconRetinaUrl =
  typeof markerIcon2x === "string" ? markerIcon2x : markerIcon2x.src;
const shadowUrl =
  typeof markerShadow === "string" ? markerShadow : markerShadow.src;

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export function TripMapInner({ points }: { points: MapPoint[] }) {
  // Titik tengah dan zoom awal: rata-rata koordinat, fallback ke Indonesia.
  const center = useMemo<[number, number]>(() => {
    if (points.length === 0) return [-2.5, 118];
    const sum = points.reduce(
      (acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }),
      { lat: 0, lng: 0 },
    );
    return [sum.lat / points.length, sum.lng / points.length];
  }, [points]);

  return (
    <MapContainer
      center={center}
      zoom={points.length > 1 ? 11 : points.length === 1 ? 14 : 5}
      scrollWheelZoom={false}
      className="h-[360px] w-full rounded-lg border border-neutral-200"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={DefaultIcon}>
          <Popup>
            <span className="block text-[13px] font-medium text-neutral-900">
              {p.name}
            </span>
            {p.address ? (
              <span className="mt-0.5 block text-[12px] text-neutral-600">
                {p.address}
              </span>
            ) : null}
            <a
              href={googleMapsUrl({ lat: p.lat, lng: p.lng, name: p.name })}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-[12px] font-medium text-teal-700 underline"
            >
              Buka di Google Maps
            </a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
