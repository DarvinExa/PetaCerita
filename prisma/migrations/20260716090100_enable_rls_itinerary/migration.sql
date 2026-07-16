-- Aktifkan Row Level Security tanpa policy pada tabel places dan itinerary_items.
-- Sama seperti tabel domain lain: semua akses lewat Next.js server + Prisma
-- (role postgres, bypass RLS). Ini menutup akses Supabase Data API (anon key)
-- sehingga data itinerary tidak bisa dibaca langsung dari PostgREST.

ALTER TABLE "public"."places" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."itinerary_items" ENABLE ROW LEVEL SECURITY;
