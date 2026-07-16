"use client";

import { useState, useTransition } from "react";
import { MapPin, ArrowClockwise } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input, FormField } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { CATEGORY_ORDER, CATEGORY_META } from "@/features/itinerary/categories";
import { resolveGmapsLink, attachPlaceFromLink } from "./actions";

type Resolved = {
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  googleMapsUrl: string;
};

/**
 * Tambah tempat dengan menempel link Google Maps. Sistem menarik nama,
 * koordinat, dan alamat (gratis, tanpa API berbayar). Foto/rating tidak
 * disimpan; teman lihat langsung lewat tombol "Buka di Google Maps" pada kartu.
 */
export function PlaceLinkForm({
  tripId,
  onDone,
}: {
  tripId: string;
  onDone: () => void;
}) {
  const { notify } = useToast();
  const [link, setLink] = useState("");
  const [category, setCategory] = useState("KULINER");
  const [resolved, setResolved] = useState<Resolved | null>(null);
  const [resolving, startResolve] = useTransition();
  const [saving, setSaving] = useState(false);

  function check() {
    const value = link.trim();
    if (!value) {
      notify({ tone: "danger", title: "Tempel link Google Maps dulu." });
      return;
    }
    startResolve(async () => {
      const res = await resolveGmapsLink(value);
      if (res.status === "error") {
        setResolved(null);
        notify({ tone: "danger", title: res.message });
        return;
      }
      setResolved(res.place);
    });
  }

  async function save() {
    if (!resolved) return;
    setSaving(true);
    const res = await attachPlaceFromLink({
      tripId,
      category,
      name: resolved.name,
      address: resolved.address,
      lat: resolved.lat,
      lng: resolved.lng,
      googleMapsUrl: resolved.googleMapsUrl,
    });
    setSaving(false);
    if (res && "error" in res) {
      notify({ tone: "danger", title: res.error });
      return;
    }
    notify({
      tone: "success",
      title: `${resolved.name} ditambahkan ke Bucket`,
    });
    onDone();
  }

  return (
    <div className="flex flex-col gap-4">
      <FormField
        label="Link Google Maps"
        htmlFor="gmaps-link"
        helperText="Buka tempat di Google Maps, tap Bagikan, salin link, tempel di sini."
      >
        <div className="flex gap-2">
          <Input
            id="gmaps-link"
            value={link}
            onChange={(e) => {
              setLink(e.target.value);
              setResolved(null);
            }}
            placeholder="https://maps.app.goo.gl/..."
            autoComplete="off"
            inputMode="url"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={check}
            loading={resolving}
          >
            Cek
          </Button>
        </div>
      </FormField>

      {resolved ? (
        <div className="doodle-box-alt border border-white/70 bg-neutral-50/60 p-3">
          <div className="flex items-start gap-2">
            <MapPin
              className="mt-0.5 size-4 shrink-0 text-teal-600"
              aria-hidden
            />
            <div className="min-w-0">
              <p className="truncate text-[15px] font-medium text-neutral-900">
                {resolved.name}
              </p>
              {resolved.address ? (
                <p className="mt-0.5 text-[13px] text-neutral-600">
                  {resolved.address}
                </p>
              ) : (
                <p className="mt-0.5 text-[13px] text-neutral-400">
                  Alamat tidak terdeteksi
                </p>
              )}
              <p className="mt-1 text-[12px] leading-5 text-teal-700">
                Link asli disimpan untuk foto, ulasan, dan detail tempat.
              </p>
            </div>
            <button
              type="button"
              onClick={check}
              className="doodle-button ml-auto flex size-11 shrink-0 items-center justify-center doodle-sticker text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
              aria-label="Cek ulang link"
            >
              <ArrowClockwise className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      ) : null}

      <FormField label="Kategori" htmlFor="link-category" required>
        <select
          id="link-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-10 w-full doodle-box-alt border border-white/70 bg-white px-3 text-[15px] text-neutral-900 outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-1"
        >
          {CATEGORY_ORDER.map((key) => (
            <option key={key} value={key}>
              {CATEGORY_META[key].label}
            </option>
          ))}
        </select>
      </FormField>

      <div className="mt-1 flex justify-end">
        <Button
          type="button"
          onClick={save}
          disabled={!resolved}
          loading={saving}
        >
          Tambah ke Bucket
        </Button>
      </div>
    </div>
  );
}
