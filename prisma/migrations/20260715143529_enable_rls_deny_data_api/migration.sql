-- Aktifkan Row Level Security tanpa policy pada semua tabel domain.
-- Semua akses data lewat Next.js server + Prisma (role postgres, bypass RLS).
-- Tujuan: menutup akses Supabase Data API (PostgREST) yang memakai anon key.
-- Tanpa policy, RLS menolak semua akses via anon/authenticated role.
-- Policy granular menyusul di milestone Realtime bila akses langsung dibutuhkan.

ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."trips" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."trip_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."days" ENABLE ROW LEVEL SECURITY;
