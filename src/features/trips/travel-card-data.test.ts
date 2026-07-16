import { describe, expect, it } from "vitest";
import {
  safeCardFilename,
  summarizeList,
  uniqueNames,
} from "./travel-card-data";

describe("travel card data", () => {
  it("menghapus nama kosong dan duplikat tanpa mengubah urutan", () => {
    expect(uniqueNames(["Ana", " Budi ", "ana", ""])).toEqual(["Ana", "Budi"]);
  });

  it("meringkas daftar panjang", () => {
    expect(summarizeList(["Ana", "Budi", "Cetrin", "Doni"], 3)).toBe(
      "Ana, Budi, Cetrin +1 lainnya",
    );
  });

  it("membuat nama file yang aman", () => {
    expect(safeCardFilename("Jelajah Jogja & Solo!")).toBe(
      "petacerita-jelajah-jogja-solo.png",
    );
    expect(safeCardFilename("   ")).toBe("petacerita-perjalanan.png");
    expect(safeCardFilename("Jogja", "overlay")).toBe(
      "petacerita-jogja-overlay-rute.png",
    );
  });
});
