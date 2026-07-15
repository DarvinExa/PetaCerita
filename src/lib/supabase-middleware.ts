import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Rute yang boleh diakses tanpa login. */
const PUBLIC_PATHS = ["/", "/login", "/register", "/auth", "/join"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

/**
 * Segarkan sesi Supabase di setiap request dan lindungi rute privat.
 * Wajib: jangan sisipkan kode antara createServerClient dan getClaims,
 * dan kembalikan response ini apa adanya agar cookie tidak hilang.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // getClaims memverifikasi tanda tangan JWT terhadap kunci publik project.
  const { data } = await supabase.auth.getClaims();
  const isAuthed = Boolean(data?.claims);

  const { pathname } = request.nextUrl;

  // Belum login dan menuju rute privat -> arahkan ke login.
  if (!isAuthed && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Sudah login tapi membuka halaman auth -> arahkan ke dashboard.
  if (isAuthed && (pathname === "/login" || pathname === "/register")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
