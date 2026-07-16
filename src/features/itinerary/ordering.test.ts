import { describe, it, expect } from "vitest";
import { insertAt, reindex, nextOrder, type Orderable } from "./ordering";

function items(...ids: string[]): Orderable[] {
  return ids.map((id, index) => ({ id, order: index }));
}

describe("insertAt", () => {
  it("menyisipkan ke kontainer kosong", () => {
    expect(insertAt([], "x", 0)).toEqual([{ id: "x", order: 0 }]);
  });

  it("menyisipkan di awal", () => {
    expect(insertAt(items("a", "b"), "x", 0)).toEqual([
      { id: "x", order: 0 },
      { id: "a", order: 1 },
      { id: "b", order: 2 },
    ]);
  });

  it("menyisipkan di tengah", () => {
    expect(insertAt(items("a", "b", "c"), "x", 1)).toEqual([
      { id: "a", order: 0 },
      { id: "x", order: 1 },
      { id: "b", order: 2 },
      { id: "c", order: 3 },
    ]);
  });

  it("menyisipkan di akhir", () => {
    expect(insertAt(items("a", "b"), "x", 2)).toEqual([
      { id: "a", order: 0 },
      { id: "b", order: 1 },
      { id: "x", order: 2 },
    ]);
  });

  it("meng-clamp index di luar rentang ke akhir", () => {
    expect(insertAt(items("a", "b"), "x", 99)).toEqual([
      { id: "a", order: 0 },
      { id: "b", order: 1 },
      { id: "x", order: 2 },
    ]);
  });

  it("meng-clamp index negatif ke awal", () => {
    expect(insertAt(items("a"), "x", -5)).toEqual([
      { id: "x", order: 0 },
      { id: "a", order: 1 },
    ]);
  });

  it("mengabaikan urutan order awal yang berlubang", () => {
    const siblings: Orderable[] = [
      { id: "a", order: 5 },
      { id: "b", order: 10 },
    ];
    expect(insertAt(siblings, "x", 1)).toEqual([
      { id: "a", order: 0 },
      { id: "x", order: 1 },
      { id: "b", order: 2 },
    ]);
  });
});

describe("reindex", () => {
  it("merapatkan order yang berlubang menjadi 0..n-1", () => {
    const list: Orderable[] = [
      { id: "a", order: 3 },
      { id: "b", order: 7 },
      { id: "c", order: 20 },
    ];
    expect(reindex(list)).toEqual([
      { id: "a", order: 0 },
      { id: "b", order: 1 },
      { id: "c", order: 2 },
    ]);
  });

  it("mengembalikan array kosong untuk input kosong", () => {
    expect(reindex([])).toEqual([]);
  });
});

describe("nextOrder", () => {
  it("mengembalikan 0 untuk kontainer kosong", () => {
    expect(nextOrder([])).toBe(0);
  });

  it("mengembalikan order maksimum + 1", () => {
    expect(
      nextOrder([
        { id: "a", order: 0 },
        { id: "b", order: 4 },
      ]),
    ).toBe(5);
  });
});
