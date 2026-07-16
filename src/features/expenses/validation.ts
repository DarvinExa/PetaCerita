import { z } from "zod";

/**
 * Skema validasi Split Bill dan Budget. Dipisah dari actions.ts (server-only)
 * agar bisa diunit-test tanpa memuat Prisma. Semua nilai uang divalidasi sebagai
 * integer minor unit non-negatif, sesuai aturan keamanan uang.
 */

// Selaras dengan Prisma enum BudgetCategory.
export const BUDGET_CATEGORIES = [
  "TRANSPORT",
  "PENGINAPAN",
  "MAKAN",
  "TIKET",
  "LAINNYA",
] as const;

// Integer minor unit non-negatif, dibatasi wajar (< 100 miliar untuk beri ruang
// mata uang bernilai kecil per unit).
const minorUnit = z
  .number()
  .int("Nominal harus bilangan bulat")
  .min(0, "Nominal tidak boleh negatif")
  .max(100_000_000_000, "Nominal terlalu besar");

// Kurs ke base currency: positif, sampai 8 desimal. 1 bila mata uang sama.
const rate = z
  .number()
  .positive("Kurs harus lebih dari nol")
  .max(1_000_000_000, "Kurs terlalu besar");

// Kode mata uang ISO-ish: 3 huruf kapital.
const currencyCode = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, "Kode mata uang harus 3 huruf");

// Bagian seorang anggota atas sebuah item.
const shareSchema = z.object({
  memberId: z.string().uuid(),
  shareAmount: minorUnit,
});

// Satu item bill. Item biasa (isShared false) wajib punya minimal satu share dan
// jumlah share == amount. Item bersama (pajak/parkir) tidak memakai share; nanti
// dibagi rata ke peserta bill di lapisan logika.
const itemSchema = z
  .object({
    name: z.string().trim().min(1, "Nama item wajib diisi").max(120),
    amount: minorUnit,
    isShared: z.boolean().default(false),
    shares: z.array(shareSchema).default([]),
  })
  .superRefine((item, ctx) => {
    if (item.isShared) return;
    if (item.shares.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Item harus punya minimal satu peserta",
      });
      return;
    }
    // Cegah peserta duplikat pada satu item.
    const ids = new Set(item.shares.map((s) => s.memberId));
    if (ids.size !== item.shares.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Peserta item tidak boleh duplikat",
      });
      return;
    }
    const sum = item.shares.reduce((a, s) => a + s.shareAmount, 0);
    if (sum !== item.amount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Jumlah pembagian item harus sama dengan harga item",
      });
    }
  });

export const createExpenseSchema = z.object({
  tripId: z.string().uuid(),
  payerId: z.string().uuid(),
  title: z.string().trim().min(1, "Judul bill wajib diisi").max(160),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid"),
  currency: currencyCode,
  exchangeRateToBase: rate,
  budgetCategory: z.enum(BUDGET_CATEGORIES).nullish(),
  items: z
    .array(itemSchema)
    .min(1, "Bill harus punya minimal satu item")
    .max(100, "Terlalu banyak item"),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

export const updateExpenseSchema = createExpenseSchema.extend({
  expenseId: z.string().uuid(),
});

export const deleteExpenseSchema = z.object({
  tripId: z.string().uuid(),
  expenseId: z.string().uuid(),
});

export const setBudgetSchema = z.object({
  tripId: z.string().uuid(),
  category: z.enum(BUDGET_CATEGORIES),
  // String kosong berarti hapus estimasi kategori itu.
  amount: z
    .string()
    .transform((v) => v.trim())
    .refine((v) => v === "" || /^\d+$/.test(v), {
      message: "Nominal tidak valid",
    })
    .transform((v) => (v === "" ? null : Number(v)))
    .refine((v) => v === null || minorUnit.safeParse(v).success, {
      message: "Nominal tidak valid",
    }),
});

export const markPaidSchema = z.object({
  tripId: z.string().uuid(),
  fromMemberId: z.string().uuid(),
  toMemberId: z.string().uuid(),
  amount: z.number().int().min(0),
  paid: z.boolean(),
});
