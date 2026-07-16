-- Aktifkan Row Level Security tanpa policy pada tabel uang. Sama seperti tabel
-- domain lain: semua akses lewat Next.js server + Prisma (role postgres,
-- bypass RLS). Ini menutup akses Supabase Data API (anon key) sehingga data
-- keuangan (expense, share, settlement, budget) tidak bisa dibaca langsung
-- dari PostgREST.

ALTER TABLE "public"."expenses" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."expense_items" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."expense_item_shares" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."settlements" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."budget_plans" ENABLE ROW LEVEL SECURITY;
