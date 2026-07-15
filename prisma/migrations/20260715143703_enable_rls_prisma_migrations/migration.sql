-- Tabel internal Prisma juga terekspos ke PostgREST. Aktifkan RLS tanpa policy
-- agar riwayat migrasi tidak bisa dibaca lewat Supabase Data API (anon key).
-- Prisma CLI memakai role postgres (bypass RLS), jadi migrasi tetap jalan.

-- Conditional: di shadow database Prisma, tabel ini belum tentu ada saat replay.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = '_prisma_migrations'
  ) THEN
    EXECUTE 'ALTER TABLE "public"."_prisma_migrations" ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;
