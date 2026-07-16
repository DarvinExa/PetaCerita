import { describe, it, expect } from "vitest";
import { parseGmapsLink, isGmapsLink } from "./parse-gmaps-link";
import { googleMapsUrl } from "./gmaps-url";

describe("isGmapsLink", () => {
  it("mengenali berbagai host Google Maps", () => {
    expect(isGmapsLink("https://www.google.com/maps/place/Tugu")).toBe(true);
    expect(isGmapsLink("https://maps.google.com/?q=Tugu")).toBe(true);
    expect(isGmapsLink("https://maps.app.goo.gl/abc123")).toBe(true);
    expect(isGmapsLink("https://goo.gl/maps/xyz")).toBe(true);
    expect(isGmapsLink("Tugu Jogja")).toBe(false);
    expect(isGmapsLink("https://example.com")).toBe(false);
  });
});

describe("parseGmapsLink", () => {
  it("ekstrak koordinat dari token @lat,lng", () => {
    const r = parseGmapsLink(
      "https://www.google.com/maps/@-7.7956,110.3695,15z",
    );
    expect(r?.lat).toBeCloseTo(-7.7956);
    expect(r?.lng).toBeCloseTo(110.3695);
  });

  it("ekstrak nama tempat dari segmen /place/", () => {
    const r = parseGmapsLink(
      "https://www.google.com/maps/place/Tugu+Yogyakarta/@-7.78,110.36,17z",
    );
    expect(r?.query).toBe("Tugu Yogyakarta");
    // Koordinat @ tetap diambil.
    expect(r?.lat).toBeCloseTo(-7.78);
  });

  it("membaca parameter q berisi koordinat", () => {
    const r = parseGmapsLink("https://maps.google.com/?q=-7.8,110.4");
    expect(r?.lat).toBeCloseTo(-7.8);
    expect(r?.lng).toBeCloseTo(110.4);
    expect(r?.query).toBeNull();
  });

  it("membaca parameter q berisi nama", () => {
    const r = parseGmapsLink("https://maps.google.com/?q=Malioboro%20Mall");
    expect(r?.query).toBe("Malioboro Mall");
  });

  it("membaca pola !3d!4d pada URL data", () => {
    const r = parseGmapsLink(
      "https://www.google.com/maps/place/X/data=!3d-7.79!4d110.37",
    );
    expect(r?.lat).toBeCloseTo(-7.79);
    expect(r?.lng).toBeCloseTo(110.37);
  });

  it("memprioritaskan koordinat listing di atas pusat viewport", () => {
    const r = parseGmapsLink(
      "https://www.google.com/maps/place/X/@-7.7000,110.3000,13z/data=!3d-7.7956!4d110.3695",
    );
    expect(r?.lat).toBeCloseTo(-7.7956);
    expect(r?.lng).toBeCloseTo(110.3695);
  });

  it("link pendek dikenali tapi tanpa data koordinat/nama", () => {
    const r = parseGmapsLink("https://maps.app.goo.gl/abc123");
    expect(r).toEqual({ lat: null, lng: null, query: null });
  });

  it("menolak koordinat di luar rentang valid", () => {
    const r = parseGmapsLink("https://maps.google.com/?q=999,999");
    // Bukan koordinat valid -> diperlakukan sebagai nama.
    expect(r?.lat).toBeNull();
    expect(r?.query).toBe("999,999");
  });

  it("mengembalikan null untuk input non-maps", () => {
    expect(parseGmapsLink("halo dunia")).toBeNull();
    expect(parseGmapsLink("")).toBeNull();
  });
});

describe("googleMapsUrl", () => {
  it("mempertahankan link Google Maps sumber", () => {
    const sourceUrl = "https://maps.app.goo.gl/abc123";
    expect(googleMapsUrl({ sourceUrl, lat: -7.79, lng: 110.37 })).toBe(
      sourceUrl,
    );
  });

  it("pakai koordinat bila tersedia", () => {
    expect(googleMapsUrl({ lat: -7.79, lng: 110.37 })).toBe(
      "https://www.google.com/maps/search/?api=1&query=-7.79,110.37",
    );
  });

  it("fallback ke nama tempat ter-encode", () => {
    expect(googleMapsUrl({ name: "Tugu Jogja" })).toBe(
      "https://www.google.com/maps/search/?api=1&query=Tugu%20Jogja",
    );
  });

  it("mengabaikan koordinat non-finite", () => {
    expect(googleMapsUrl({ lat: NaN, lng: 1, name: "X" })).toBe(
      "https://www.google.com/maps/search/?api=1&query=X",
    );
  });
});
