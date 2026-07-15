-- Aktifkan Row Level Security tanpa policy pada tabel trip_invites.
-- Sama seperti tabel domain lain: semua akses lewat Next.js server + Prisma
-- (role postgres, bypass RLS). Ini menutup akses Supabase Data API (anon key)
-- sehingga token invite tidak bisa dibaca langsung dari PostgREST.

ALTER TABLE "public"."trip_invites" ENABLE ROW LEVEL SECURITY;
