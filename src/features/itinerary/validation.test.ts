import { describe, it, expect } from "vitest";
import {
  createPlaceSchema,
  updateItemSchema,
  moveItemSchema,
} from "./validation";

const TRIP = "11111111-1111-4111-8111-111111111111";
const ITEM = "22222222-2222-4222-8222-222222222222";
const DAY = "33333333-3333-4333-8333-333333333333";

describe("createPlaceSchema", () => {
  it("menerima input minimal yang valid", () => {
    const r = createPlaceSchema.safeParse({
      tripId: TRIP,
      name: "Malioboro",
      category: "KULINER",
    });
    expect(r.success).toBe(true);
  });

  it("menolak nama kosong", () => {
    const r = createPlaceSchema.safeParse({
      tripId: TRIP,
      name: "   ",
      category: "ALAM",
    });
    expect(r.success).toBe(false);
  });

  it("menolak kategori tidak dikenal", () => {
    const r = createPlaceSchema.safeParse({
      tripId: TRIP,
      name: "Pantai",
      category: "PANTAI",
    });
    expect(r.success).toBe(false);
  });
});

describe("updateItemSchema", () => {
  const base = { tripId: TRIP, itemId: ITEM, category: "ALAM" as const };

  it("menerima biaya integer non-negatif", () => {
    const r = updateItemSchema.safeParse({ ...base, estimatedCost: "50000" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.estimatedCost).toBe(50000);
  });

  it("mengubah biaya kosong menjadi null", () => {
    const r = updateItemSchema.safeParse({ ...base, estimatedCost: "" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.estimatedCost).toBeNull();
  });

  it("menolak biaya negatif", () => {
    const r = updateItemSchema.safeParse({ ...base, estimatedCost: "-10" });
    expect(r.success).toBe(false);
  });

  it("menolak biaya non-integer", () => {
    const r = updateItemSchema.safeParse({ ...base, estimatedCost: "12.5" });
    expect(r.success).toBe(false);
  });

  it("menerima waktu HH:MM valid", () => {
    const r = updateItemSchema.safeParse({
      ...base,
      startTime: "09:30",
      endTime: "11:00",
      estimatedCost: "",
    });
    expect(r.success).toBe(true);
  });

  it("menolak waktu tidak valid", () => {
    const r = updateItemSchema.safeParse({
      ...base,
      startTime: "25:00",
      estimatedCost: "",
    });
    expect(r.success).toBe(false);
  });

  it("menerima waktu kosong", () => {
    const r = updateItemSchema.safeParse({
      ...base,
      startTime: "",
      endTime: "",
      estimatedCost: "",
    });
    expect(r.success).toBe(true);
  });
});

describe("moveItemSchema", () => {
  it("menerima toDayId null (Bucket)", () => {
    const r = moveItemSchema.safeParse({
      tripId: TRIP,
      itemId: ITEM,
      toDayId: null,
      toIndex: 0,
    });
    expect(r.success).toBe(true);
  });

  it("menerima toDayId uuid dan index", () => {
    const r = moveItemSchema.safeParse({
      tripId: TRIP,
      itemId: ITEM,
      toDayId: DAY,
      toIndex: 3,
    });
    expect(r.success).toBe(true);
  });

  it("menolak toIndex negatif", () => {
    const r = moveItemSchema.safeParse({
      tripId: TRIP,
      itemId: ITEM,
      toDayId: null,
      toIndex: -1,
    });
    expect(r.success).toBe(false);
  });
});
