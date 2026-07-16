"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { googleMapsUrl } from "./gmaps-url";

export type MapPoint = {
  id: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  googleMapsUrl?: string | null;
  label?: string;
  targetId?: string;
};

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

function numberedIcon(label: string) {
  const safeLabel = /^\d{1,2}$/.test(label) ? label : "";
  if (!safeLabel) return DefaultIcon;
  return L.divIcon({
    className: "",
    html: `<span style="display:grid;place-items:center;width:30px;height:30px;border:3px solid white;border-radius:10px;background:#0f766e;color:white;font:700 12px system-ui;box-shadow:0 2px 8px rgba(28,25,23,.28)">${safeLabel}</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -18],
  });
}

const OSM_TILE_URL = [
  "https:/",
  "/tile.openstreetmap.org/",
  "{z}",
  "/",
  "{x}",
  "/",
  "{y}",
  ".png",
].join("");

function MapViewport({ points }: { points: MapPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 1) {
      map.setView([points[0]!.lat, points[0]!.lng], 14);
      return;
    }
    if (points.length > 1) {
      map.fitBounds(
        L.latLngBounds(points.map((point) => [point.lat, point.lng])),
        { padding: [24, 24], maxZoom: 14 },
      );
    }
  }, [map, points]);
  return null;
}

export function TripMapInner({
  points,
  showPath = false,
}: {
  points: MapPoint[];
  showPath?: boolean;
}) {
  const center = useMemo<[number, number]>(() => {
    if (points.length === 0) return [-2.5, 118];
    const sum = points.reduce(
      (acc, point) => ({ lat: acc.lat + point.lat, lng: acc.lng + point.lng }),
      { lat: 0, lng: 0 },
    );
    return [sum.lat / points.length, sum.lng / points.length];
  }, [points]);

  const path = points.map(
    (point) => [point.lat, point.lng] as [number, number],
  );

  return (
    <MapContainer
      center={center}
      zoom={points.length > 1 ? 11 : 14}
      scrollWheelZoom={false}
      className="relative z-0 h-[240px] w-full overflow-hidden doodle-box-alt border border-white/70"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url={OSM_TILE_URL}
      />
      <MapViewport points={points} />
      {showPath && path.length > 1 ? (
        <Polyline
          positions={path}
          pathOptions={{ color: "#0f766e", weight: 3, opacity: 0.72 }}
        />
      ) : null}
      {points.map((point) => (
        <Marker
          key={point.id}
          position={[point.lat, point.lng]}
          icon={point.label ? numberedIcon(point.label) : DefaultIcon}
        >
          <Popup>
            <span className="block text-[13px] font-medium text-neutral-900">
              {point.label ? `${point.label}. ` : ""}
              {point.name}
            </span>
            {point.address ? (
              <span className="mt-0.5 block text-[12px] text-neutral-600">
                {point.address}
              </span>
            ) : null}
            <span className="mt-1 flex flex-wrap gap-2">
              {point.targetId ? (
                <a
                  href={`#${point.targetId}`}
                  className="text-[12px] font-medium text-teal-700 underline"
                >
                  Lihat di jadwal
                </a>
              ) : null}
              <a
                href={googleMapsUrl({
                  sourceUrl: point.googleMapsUrl,
                  lat: point.lat,
                  lng: point.lng,
                  name: point.name,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] font-medium text-teal-700 underline"
              >
                Buka di Google Maps
              </a>
            </span>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
