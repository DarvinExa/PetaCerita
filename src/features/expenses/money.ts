/**
 * Logika uang murni untuk Split Bill dan netting (PRD 5.5, 6). Tidak menyentuh
 * Prisma, server-only, maupun DOM, sehingga bisa diunit-test menyeluruh tanpa
 * database. Semua nilai uang adalah INTEGER minor unit (untuk IDR: rupiah utuh),
 * tidak pernah float, sesuai aturan keamanan uang.
 *
 * Prinsip kebenaran utama: untuk tiap expense, total dikonversi ke base currency
 * SATU KALI, lalu didistribusikan ke para penghutang dengan metode largest
 * remainder. Dengan begitu jumlah seluruh debit selalu sama persis dengan kredit
 * payer, dan total net semua anggota dijamin nol (tidak ada rupiah yang hilang
 * atau tercipta akibat pembulatan).
 */

export type MemberId = string;

/** Bagian seorang anggota atas satu item, dalam currency expense. */
export interface ShareInput {
  memberId: MemberId;
  shareAmount: number;
}

/**
 * Satu item bill. `amount` dalam currency expense (minor unit). Item biasa punya
 * daftar `shares` (siapa ikut dan berapa). Item `isShared` (pajak, service,
 * parkir) diabaikan `shares`-nya dan dibagi rata ke semua peserta bill.
 */
export interface ItemInput {
  amount: number;
  isShared: boolean;
  shares: ShareInput[];
}

/**
 * Satu expense/bill. `rate` adalah kurs ke base currency (1 unit currency = rate
 * unit base); bernilai 1 bila currency == base. Peserta bill diturunkan dari
 * gabungan anggota yang muncul pada share item non-shared.
 */
export interface ExpenseInput {
  payerId: MemberId;
  rate: number;
  items: ItemInput[];
}

export interface Transfer {
  fromMemberId: MemberId;
  toMemberId: MemberId;
  amount: number;
}

/**
 * Distribusikan `total` (integer, >= 0) menurut `weights` (integer, >= 0) dengan
 * metode largest remainder sehingga jumlah hasil == total persis. Sisa unit
 * akibat pembulatan diberikan ke indeks dengan remainder terbesar (tie-break:
 * indeks lebih kecil dulu) agar deterministik. Memakai BigInt untuk perkalian
 * agar aman dari batas presisi Number.
 */
export function distribute(total: number, weights: number[]): number[] {
  if (!Number.isInteger(total) || total < 0) {
    throw new Error("total harus integer non-negatif");
  }
  const n = weights.length;
  if (n === 0) return [];
  if (weights.some((w) => !Number.isInteger(w) || w < 0)) {
    throw new Error("weights harus integer non-negatif");
  }

  const sumW = weights.reduce((a, b) => a + b, 0);
  if (sumW === 0) {
    // Tanpa bobot berarti: bagi rata sebagai fallback yang masuk akal.
    return distribute(
      total,
      weights.map(() => 1),
    );
  }

  const T = BigInt(total);
  const S = BigInt(sumW);
  const floors = new Array<number>(n);
  const remainders = new Array<{ index: number; rem: bigint }>(n);
  let assigned = 0;

  for (let i = 0; i < n; i++) {
    const numerator = T * BigInt(weights[i]!);
    const q = numerator / S;
    const r = numerator % S;
    floors[i] = Number(q);
    remainders[i] = { index: i, rem: r };
    assigned += floors[i]!;
  }

  let leftover = total - assigned;
  // Urutkan remainder terbesar dulu; tie-break indeks kecil dulu.
  remainders.sort((a, b) => {
    if (a.rem === b.rem) return a.index - b.index;
    return a.rem > b.rem ? -1 : 1;
  });
  const result = floors.slice();
  for (let k = 0; k < remainders.length && leftover > 0; k++) {
    result[remainders[k]!.index]! += 1;
    leftover--;
  }
  return result;
}

/**
 * Bagi rata `amount` ke `memberIds` (largest remainder). Dipakai untuk share
 * default sebuah item dan untuk membagi biaya bersama. Mengembalikan pasangan
 * memberId dan bagiannya dalam currency yang sama dengan amount.
 */
export function evenShares(
  amount: number,
  memberIds: MemberId[],
): ShareInput[] {
  const parts = distribute(
    amount,
    memberIds.map(() => 1),
  );
  return memberIds.map((memberId, i) => ({ memberId, shareAmount: parts[i]! }));
}

/**
 * Konversi `amountMinor` (integer, currency) ke base currency memakai `rate`
 * (kurs manual, sampai 8 desimal). Perkalian dilakukan dengan BigInt lalu
 * dibulatkan ke integer terdekat (half-up), sehingga bebas galat float.
 */
export function convertToBase(amountMinor: number, rate: number): number {
  if (!Number.isInteger(amountMinor)) {
    throw new Error("amount harus integer minor unit");
  }
  if (!(rate >= 0) || !Number.isFinite(rate)) {
    throw new Error("rate harus angka non-negatif");
  }
  const SCALE = BigInt(100_000_000); // 8 desimal
  const rateScaled = BigInt(Math.round(rate * 1e8));
  const negative = amountMinor < 0;
  const product = BigInt(Math.abs(amountMinor)) * rateScaled;
  const half = SCALE / BigInt(2);
  const rounded = (product + half) / SCALE;
  const value = Number(rounded);
  return negative ? -value : value;
}

/** Peserta bill: gabungan anggota pada seluruh share item non-shared. */
function billParticipants(items: ItemInput[]): MemberId[] {
  const seen = new Set<MemberId>();
  const order: MemberId[] = [];
  for (const item of items) {
    if (item.isShared) continue;
    for (const s of item.shares) {
      if (!seen.has(s.memberId)) {
        seen.add(s.memberId);
        order.push(s.memberId);
      }
    }
  }
  return order;
}

/**
 * Hitung berapa yang ditanggung tiap anggota untuk satu expense, dalam currency
 * expense (belum dikonversi). Item biasa memakai share tersimpan; item bersama
 * dibagi rata ke peserta bill.
 */
export function owedPerMemberInCurrency(
  expense: ExpenseInput,
): Map<MemberId, number> {
  const owed = new Map<MemberId, number>();
  const add = (id: MemberId, amt: number) =>
    owed.set(id, (owed.get(id) ?? 0) + amt);

  const participants = billParticipants(expense.items);

  for (const item of expense.items) {
    if (item.isShared) {
      if (participants.length === 0) continue;
      for (const s of evenShares(item.amount, participants)) {
        add(s.memberId, s.shareAmount);
      }
    } else {
      for (const s of item.shares) add(s.memberId, s.shareAmount);
    }
  }
  return owed;
}

/**
 * Net posisi tiap anggota dalam base currency dari akumulasi semua expense.
 * Positif berarti anggota tersebut harus MENERIMA (dibayari orang lain),
 * negatif berarti harus MEMBAYAR. Total seluruh net dijamin nol.
 */
export function netBalances(expenses: ExpenseInput[]): Map<MemberId, number> {
  const net = new Map<MemberId, number>();
  const bump = (id: MemberId, amt: number) =>
    net.set(id, (net.get(id) ?? 0) + amt);

  for (const expense of expenses) {
    const owedCurrency = owedPerMemberInCurrency(expense);
    const members = [...owedCurrency.keys()];
    if (members.length === 0) continue;

    const totalCurrency = members.reduce(
      (a, m) => a + (owedCurrency.get(m) ?? 0),
      0,
    );
    if (totalCurrency <= 0) continue;

    // Konversi total sekali, lalu bagi ke anggota proporsional dengan porsi
    // currency-nya (largest remainder) agar jumlah debit == kredit payer.
    const totalBase = convertToBase(totalCurrency, expense.rate);
    const weights = members.map((m) => owedCurrency.get(m) ?? 0);
    const owedBase = distribute(totalBase, weights);

    members.forEach((m, i) => bump(m, -owedBase[i]!));
    bump(expense.payerId, totalBase);
  }

  return net;
}

/**
 * Minimalkan jumlah transfer dari peta net (base currency). Algoritma greedy
 * ala Splitwise: cocokkan kreditur terbesar dengan debitur terbesar berulang.
 * Deterministik: urutkan nominal menurun, tie-break memberId menaik.
 */
export function minimizeTransfers(net: Map<MemberId, number>): Transfer[] {
  const creditors: { id: MemberId; amt: number }[] = [];
  const debtors: { id: MemberId; amt: number }[] = [];

  for (const [id, amt] of net) {
    if (amt > 0) creditors.push({ id, amt });
    else if (amt < 0) debtors.push({ id, amt: -amt });
  }

  const byAmtThenId = (
    a: { id: MemberId; amt: number },
    b: { id: MemberId; amt: number },
  ) =>
    b.amt !== a.amt ? b.amt - a.amt : a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  creditors.sort(byAmtThenId);
  debtors.sort(byAmtThenId);

  const transfers: Transfer[] = [];
  let ci = 0;
  let di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const c = creditors[ci]!;
    const d = debtors[di]!;
    const amount = Math.min(c.amt, d.amt);
    if (amount > 0) {
      transfers.push({
        fromMemberId: d.id,
        toMemberId: c.id,
        amount,
      });
    }
    c.amt -= amount;
    d.amt -= amount;
    if (c.amt === 0) ci++;
    if (d.amt === 0) di++;
  }
  return transfers;
}

/**
 * Ringkasan drill-down untuk satu anggota (PRD 6): total net, daftar yang harus
 * ia bayar, dan daftar yang harus membayar ke dia. Diturunkan dari daftar
 * transfer hasil netting.
 */
export function memberSettlement(
  memberId: MemberId,
  transfers: Transfer[],
  net: Map<MemberId, number>,
): {
  net: number;
  mustPay: { toMemberId: MemberId; amount: number }[];
  willReceive: { fromMemberId: MemberId; amount: number }[];
} {
  const mustPay = transfers
    .filter((t) => t.fromMemberId === memberId)
    .map((t) => ({ toMemberId: t.toMemberId, amount: t.amount }));
  const willReceive = transfers
    .filter((t) => t.toMemberId === memberId)
    .map((t) => ({ fromMemberId: t.fromMemberId, amount: t.amount }));
  return { net: net.get(memberId) ?? 0, mustPay, willReceive };
}
