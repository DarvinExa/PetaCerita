import { describe, expect, it } from "vitest";
import {
  distanceLevel,
  haversineKm,
  nearestPoint,
  routeSegments,
  totalHaversineKm,
} from "./distance";

const jakarta = {
  id: "jakarta",
  name: "Jakarta",
  lat: -6.2088,
  lng: 106.8456,
};
const bandung = {
  id: "bandung",
  name: "Bandung",
  lat: -6.9175,
  lng: 107.6191,
};

describe("haversineKm", () => {
  it("menghasilkan nol untuk titik yang sama", () => {
    expect(haversineKm(jakarta, jakarta)).toBe(0);
  });

  it("menghitung jarak garis lurus Jakarta ke Bandung", () => {
    expect(haversineKm(jakarta, bandung)).toBeGreaterThan(110);
    expect(haversineKm(jakarta, bandung)).toBeLessThan(130);
  });

  it("simetris", () => {
    expect(haversineKm(jakarta, bandung)).toBeCloseTo(
      haversineKm(bandung, jakarta),
      8,
    );
  });
});

describe("route distance", () => {
  it("membentuk segmen berurutan dan menjumlahkan jarak", () => {
    const midpoint = {
      id: "mid",
      name: "Titik tengah",
      lat: -6.55,
      lng: 107.2,
    };
    const segments = routeSegments([jakarta, midpoint, bandung]);
    expect(segments).toHaveLength(2);
    expect(totalHaversineKm([jakarta, midpoint, bandung])).toBeCloseTo(
      segments[0]!.distanceKm + segments[1]!.distanceKm,
      8,
    );
  });
});

describe("distance insights", () => {
  it("mengelompokkan ambang jarak", () => {
    expect(distanceLevel(3)).toBe("NEAR");
    expect(distanceLevel(10)).toBe("MEDIUM");
    expect(distanceLevel(20)).toBe("FAR");
  });

  it("memilih titik terdekat", () => {
    const nearJakarta = {
      id: "candidate",
      name: "Kandidat",
      lat: -6.21,
      lng: 106.85,
    };
    expect(nearestPoint(nearJakarta, [bandung, jakarta])?.point.id).toBe(
      "jakarta",
    );
  });
});
