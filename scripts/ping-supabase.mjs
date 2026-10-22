/**
 * Script untuk mem-ping Supabase agar proyek tidak ter-pause (inactivity auto-pause).
 * Supabase Free Tier akan ter-pause otomatis jika tidak ada request selama 7 hari.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = resolve(__dirname, "../.env.local");
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Gagal: NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_ANON_KEY belum diatur.");
  process.exit(1);
}

async function pingSupabase() {
  const cleanUrl = supabaseUrl.replace(/\/$/, "");
  const healthEndpoint = `${cleanUrl}/auth/v1/health`;
  const restEndpoint = `${cleanUrl}/rest/v1/`;

  console.log(`Menghubungi Supabase di: ${cleanUrl}`);

  try {
    // 1. Ping Auth Health
    const healthRes = await fetch(healthEndpoint, {
      method: "GET",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    console.log(`Auth Health: ${healthRes.status} ${healthRes.statusText}`);

    // 2. Ping REST API
    const restRes = await fetch(restEndpoint, {
      method: "GET",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    console.log(`REST API: ${restRes.status} ${restRes.statusText}`);

    if (healthRes.ok || restRes.status !== 503) {
      console.log("\nBerhasil: Aktivitas tercatat di Supabase!");
      console.log("Proyek Supabase akan tetap aktif dan tidak akan ter-pause.");
    }
  } catch (error) {
    console.error("\nGagal menghubungi Supabase:", error.message);
    console.error("Jika proyek saat ini berstatus 'Paused', buka https://app.supabase.com lalu klik 'Restore project'.");
  }
}

pingSupabase();
