import Link from "next/link";
import { SignOut, UserCircle } from "@phosphor-icons/react/dist/ssr";
import { logout } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";

/** Header untuk area terautentikasi: brand, nama user, dan logout. */
export function AppHeader({ userName }: { userName: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-teal-900/5 bg-white/85 shadow-[0_4px_20px_rgba(15,118,110,0.05)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-4 sm:px-6">
        <Link
          href="/dashboard"
          className="group flex min-h-11 items-center gap-2.5 text-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-4"
        >
          <BrandLogo
            compact
            className="transition-transform group-hover:scale-105"
          />
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 clay-badge bg-white/95 px-3.5 py-1.5 text-[13px] font-semibold text-slate-700 border border-white sm:inline-flex shadow-sm">
            <UserCircle className="size-4 text-teal-600" aria-hidden />
            {userName}
          </span>
          <form action={logout}>
            <Button type="submit" variant="ghost" size="sm">
              <SignOut className="size-4" aria-hidden />
              <span>Keluar</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
