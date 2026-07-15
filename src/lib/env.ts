import "server-only";

/**
 * Akses environment variable server dengan validasi.
 * Import modul ini hanya dari kode server (Server Component, Route Handler,
 * Server Action). "server-only" akan menggagalkan build jika terbawa ke client.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} belum diset`);
  }
  return value;
}

export const serverEnv = {
  get databaseUrl() {
    return required("DATABASE_URL");
  },
  get directUrl() {
    return required("DIRECT_URL");
  },
  get supabaseServiceRoleKey() {
    return required("SUPABASE_SERVICE_ROLE_KEY");
  },
};

/** Nilai Supabase publik, aman dipakai di browser maupun server. */
export const publicEnv = {
  get supabaseUrl() {
    return required("NEXT_PUBLIC_SUPABASE_URL");
  },
  get supabaseAnonKey() {
    return required("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  },
};
