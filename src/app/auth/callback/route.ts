import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/server/supabase";

/**
 * Callback PKCE untuk OAuth Google dan konfirmasi email.
 * Tukar auth code jadi sesi, lalu arahkan ke tujuan (default /dashboard).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  // Cegah open redirect: hanya izinkan path internal.
  const redirectPath = next.startsWith("/") ? next : "/dashboard";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  // Gagal atau tanpa code -> kembali ke login dengan pesan error.
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
