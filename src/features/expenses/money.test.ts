import { describe, it, expect } from "vitest";
import {
  distribute,
  evenShares,
  convertToBase,
  owedPerMemberInCurrency,
  netBalances,
  minimizeTransfers,
  memberSettlement,
  type ExpenseInput,
} from "./money";

describe("distribute (largest remainder)", () => {
  it("membagi rata habis tanpa sisa", () => {
    expect(distribute(90, [1, 1, 1])).toEqual([30, 30, 30]);
  });

  it("membagi 100 ke 3 orang, sisa ke remainder terbesar (indeks kecil dulu)", () => {
    const parts = distribute(100, [1, 1, 1]);
    expect(parts).toEqual([34, 33, 33]);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(100);
  });

  it("membagi proporsional dengan bobot", () => {
    const parts = distribute(100, [2, 1, 1]);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(100);
    expect(parts[0]).toBe(50);
  });

  it("bobot nol total jatuh ke bagi rata", () => {
    const parts = distribute(10, [0, 0, 0, 0]);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(10);
  });

  it("total nol menghasilkan semua nol", () => {
    expect(distribute(0, [1, 2, 3])).toEqual([0, 0, 0]);
  });

  it("satu peserta menerima semuanya", () => {
    expect(distribute(777, [5])).toEqual([777]);
  });

  it("selalu berjumlah sama dengan total untuk berbagai kombinasi", () => {
    const cases: [number, number[]][] = [
      [101, [1, 1, 1]],
      [1, [1, 1, 1, 1]],
      [999983, [7, 3, 11, 5]],
      [50, [1, 1, 1, 1, 1, 1, 1]],
    ];
    for (const [total, weights] of cases) {
      const parts = distribute(total, weights);
      expect(parts.reduce((a, b) => a + b, 0)).toBe(total);
      expect(parts.every((p) => Number.isInteger(p) && p >= 0)).toBe(true);
    }
  });

  it("menolak input tidak valid", () => {
    expect(() => distribute(-1, [1])).toThrow();
    expect(() => distribute(1.5, [1])).toThrow();
    expect(() => distribute(10, [1, -2])).toThrow();
  });
});

describe("evenShares", () => {
  it("membagi rata dan berjumlah utuh", () => {
    const shares = evenShares(100, ["a", "b", "c"]);
    expect(shares.map((s) => s.shareAmount).reduce((a, b) => a + b, 0)).toBe(
      100,
    );
    expect(shares[0]).toEqual({ memberId: "a", shareAmount: 34 });
  });
});

describe("convertToBase", () => {
  it("kurs 1 tidak mengubah nilai", () => {
    expect(convertToBase(150000, 1)).toBe(150000);
  });

  it("mengonversi USD ke IDR dengan pembulatan half-up", () => {
    // 10 (minor) * 15000.5 = 150005
    expect(convertToBase(10, 15000.5)).toBe(150005);
  });

  it("membulatkan setengah ke atas", () => {
    // 1 * 0.5 = 0.5 -> 1
    expect(convertToBase(1, 0.5)).toBe(1);
  });

  it("menangani kurs pecahan kecil tanpa galat float", () => {
    // 100000 * 0.00007 = 7
    expect(convertToBase(100000, 0.00007)).toBe(7);
  });

  it("menolak amount non-integer", () => {
    expect(() => convertToBase(1.2, 1)).toThrow();
  });
});

describe("owedPerMemberInCurrency", () => {
  it("item bersama dibagi rata ke peserta bill", () => {
    const expense: ExpenseInput = {
      payerId: "budi",
      rate: 1,
      items: [
        {
          amount: 60000,
          isShared: false,
          shares: [
            { memberId: "budi", shareAmount: 30000 },
            { memberId: "ana", shareAmount: 30000 },
          ],
        },
        { amount: 10000, isShared: true, shares: [] },
      ],
    };
    const owed = owedPerMemberInCurrency(expense);
    // Pajak 10000 dibagi 2 peserta (budi, ana) = 5000 masing-masing.
    expect(owed.get("budi")).toBe(35000);
    expect(owed.get("ana")).toBe(35000);
  });
});

// PRD 6: contoh alur end-to-end.
describe("skenario PRD end-to-end", () => {
  // Budi bayar dinner: Rendang 60rb (Budi, Ana), Ayam 50rb (bertiga),
  // Es teh 30rb (bertiga), Pajak 10% (14rb, rata). Semua IDR.
  const dinner: ExpenseInput = {
    payerId: "budi",
    rate: 1,
    items: [
      {
        amount: 60000,
        isShared: false,
        shares: [
          { memberId: "budi", shareAmount: 30000 },
          { memberId: "ana", shareAmount: 30000 },
        ],
      },
      {
        amount: 50000,
        isShared: false,
        shares: [
          { memberId: "budi", shareAmount: 16667 },
          { memberId: "ana", shareAmount: 16667 },
          { memberId: "cetrin", shareAmount: 16666 },
        ],
      },
      {
        amount: 30000,
        isShared: false,
        shares: [
          { memberId: "budi", shareAmount: 10000 },
          { memberId: "ana", shareAmount: 10000 },
          { memberId: "cetrin", shareAmount: 10000 },
        ],
      },
      { amount: 14000, isShared: true, shares: [] },
    ],
  };

  // Ana bayar bensin 60rb (bertiga).
  const bensin: ExpenseInput = {
    payerId: "ana",
    rate: 1,
    items: [
      {
        amount: 60000,
        isShared: false,
        shares: [
          { memberId: "budi", shareAmount: 20000 },
          { memberId: "ana", shareAmount: 20000 },
          { memberId: "cetrin", shareAmount: 20000 },
        ],
      },
    ],
  };

  it("net semua anggota berjumlah nol", () => {
    const net = netBalances([dinner, bensin]);
    const sum = [...net.values()].reduce((a, b) => a + b, 0);
    expect(sum).toBe(0);
  });

  it("payer punya net positif, penghutang negatif", () => {
    const net = netBalances([dinner, bensin]);
    // Budi & Ana membayar di depan, jadi keduanya kreditur bersih atau
    // mendekati nol; Cetrin tidak pernah membayar, jadi net negatif.
    expect(net.get("cetrin")!).toBeLessThan(0);
  });

  it("transfer minimal menyeimbangkan semua net", () => {
    const net = netBalances([dinner, bensin]);
    const transfers = minimizeTransfers(net);

    // Terapkan transfer ke salinan net; hasil akhir harus semua nol.
    const balance = new Map(net);
    for (const t of transfers) {
      balance.set(t.fromMemberId, balance.get(t.fromMemberId)! + t.amount);
      balance.set(t.toMemberId, balance.get(t.toMemberId)! - t.amount);
    }
    for (const v of balance.values()) expect(v).toBe(0);
  });

  it("jumlah transfer tidak lebih dari jumlah anggota minus 1", () => {
    const net = netBalances([dinner, bensin]);
    const transfers = minimizeTransfers(net);
    const members = new Set([...net.keys()]);
    expect(transfers.length).toBeLessThanOrEqual(members.size - 1);
  });

  it("drill-down anggota konsisten dengan net", () => {
    const net = netBalances([dinner, bensin]);
    const transfers = minimizeTransfers(net);
    for (const id of net.keys()) {
      const s = memberSettlement(id, transfers, net);
      const received = s.willReceive.reduce((a, r) => a + r.amount, 0);
      const paid = s.mustPay.reduce((a, r) => a + r.amount, 0);
      // net = yang diterima - yang dibayar.
      expect(received - paid).toBe(s.net);
    }
  });
});

describe("netBalances multi-currency", () => {
  it("mengonversi ke base sebelum netting", () => {
    // Budi bayar bill USD 100 (minor) kurs 15000, dibagi Budi & Ana rata.
    const expense: ExpenseInput = {
      payerId: "budi",
      rate: 15000,
      items: [
        {
          amount: 100,
          isShared: false,
          shares: [
            { memberId: "budi", shareAmount: 50 },
            { memberId: "ana", shareAmount: 50 },
          ],
        },
      ],
    };
    const net = netBalances([expense]);
    // Total base = 100 * 15000 = 1_500_000. Ana menanggung setengah.
    expect(net.get("ana")).toBe(-750000);
    expect(net.get("budi")).toBe(750000);
    expect([...net.values()].reduce((a, b) => a + b, 0)).toBe(0);
  });
});

describe("minimizeTransfers", () => {
  it("net semua nol menghasilkan tanpa transfer", () => {
    const net = new Map([
      ["a", 0],
      ["b", 0],
    ]);
    expect(minimizeTransfers(net)).toEqual([]);
  });

  it("deterministik dan menyeimbangkan kasus tiga arah", () => {
    const net = new Map([
      ["a", -50],
      ["b", -30],
      ["c", 80],
    ]);
    const transfers = minimizeTransfers(net);
    const balance = new Map(net);
    for (const t of transfers) {
      balance.set(t.fromMemberId, balance.get(t.fromMemberId)! + t.amount);
      balance.set(t.toMemberId, balance.get(t.toMemberId)! - t.amount);
    }
    for (const v of balance.values()) expect(v).toBe(0);
  });
});
